import { inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Observer, Subscription, map } from "rxjs";
import { CONFIG, IConfig } from "../coffee-config";
import { CoffeeQueryFilter } from "./coffee-query-filter";
import { CoffeeRequestGet } from "./coffee-request-get";
import { CoffeeUtil } from "../shared/coffee-util";

export class CoffeeRequest {
  protected config = inject<IConfig>(CONFIG);
  private baseEndpoint: string = '';

  constructor(protected httpClient: HttpClient) {
    this.baseEndpoint = this.config ? this.config.baseApiUrl : "";
  }
  
  /**
   * @example
   * .get<User>('/user/info', where((model: Collection) => model.name, '==', 'john'), whereDate('createdAt', 'day', 28))
   * .returnListOf(User)
   * .subscribe({})
   * // or
   * .get<User>('/user/info')
   * .where((model: Collection) => model.name, '==', 'john') // filter with type
   * .whereDate('createdAt', 'day', 28) // filter with no type
   * .returnListOf(User)
   * .subscribe({})
   * 
   */
  get<T>(endpoint: string, ...args: CoffeeQueryFilter[]) {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestGet<T>(this.httpClient, url,...args);
  }

  /**
   * Create/Update a value on a specific endpoint, based on property id
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  save<T>(endpoint: string, vo: T, isFormData = false): {
    /**
     * If the vo object has id > 0, it uses httpClient.put; otherwise, it uses httpClient.post.
     */
    useHttpPutWhenId: () => Observable<T>,
    subscribe: (observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | undefined) => Subscription
  } {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(vo) : vo;

    const baseResponse = (usePutWhenId: boolean = false) => {
      if(usePutWhenId && (vo as any).id && (vo as any).id > 0) {
        // Object has id > 0, use httpClient.put
        return this.httpClient.put<T>(url, data);
      }
  
      // In all other cases, use httpClient.post
      return this.httpClient.post<T>(url, data);
    }

    let observable = baseResponse(false);
    
    return {
      useHttpPutWhenId: () => baseResponse(true),
      subscribe:(observerOrNext) => observable.subscribe(observerOrNext)
    }
  }

  /**
   * Create a new register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  create<T>(endpoint: string, vo: T | T[], isFormData = false): Observable<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(vo) : vo;
    return this.httpClient.post<T | T[]>(url, data);
  }
  
  /**
   * Update register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  update<T>(endpoint: string, vo: T | T[], isFormData = false): Observable<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(vo) : vo;
    return this.httpClient.put<T | T[]>(url, data);
  }

  /**
   * Delete register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param identifier the identifier to use as key for deleting
   */
  delete<bool>(endpoint: string, identifier: number | string): Observable<bool> {
    const url = CoffeeUtil.concatUrl(CoffeeUtil.concatUrl(this.baseEndpoint, endpoint), identifier);
    return this.httpClient.delete<bool>(url);
  }

  /**
   * Downloads a file from the server and saves it with the given file name.
   *
   * @param endpoint - The url of the endpoint.
   * @param model - The model (e.g { file : file }).
   * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
   * @param isFormData whether to send the data as form data or json
   * @returns An Observable that completes when the file has been downloaded.
   *
   * Usage example:
   * .downloadPut('url', form, 'file.xlsx').subscribe(() => {
   *   console.log('File downloaded successfully');
   * });
   */
   downloadPut(endpoint: string, model: any, fileNameWithExtension: string, isFormData = true) {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(model) : model;

    return this.httpClient
    .put(url, data, { responseType: 'blob' })
    .pipe(
      map((data: Blob) => {
        const downloadUrl = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileNameWithExtension;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        return data;
      })
    );
  }

  /**
   * Downloads a file from the server and saves it with the given file name.
   *
   * @param endpoint - The url of the endpoint.
   * @param model - The model (e.g { file : file }).
   * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
   * @param isFormData whether to send the data as form data or json
   * @returns An Observable that completes when the file has been downloaded.
   *
   * Usage example:
   * .downloadPost('url', form, 'file.xlsx').subscribe(() => {
   *   console.log('File downloaded successfully');
   * });
   */
  downloadPost(endpoint: string, model: any, fileNameWithExtension: string, isFormData = true) {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(model) : model;

    return this.httpClient
    .post(url, data, { responseType: 'blob' })
    .pipe(
      map((data: Blob) => {
        const downloadUrl = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileNameWithExtension;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        return data;
      })
    );
  }
}
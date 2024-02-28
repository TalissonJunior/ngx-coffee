import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CONFIG, IConfig } from "../coffee-config";
import { CoffeeQueryFilter } from "./coffee-query-filter";
import { CoffeeRequestGet } from "./coffee-request-get";
import { CoffeeUtil } from "../shared/coffee-util";
import { CoffeeEncryptService } from "../services/coffee-encrypt.service";
import { CoffeeRquestSave } from "./coffee-request-save";
import { CoffeeRequestPostPut } from "./coffee-request-post-put";
import { map } from 'rxjs/operators';

export class CoffeeRequest {
  protected config = inject<IConfig>(CONFIG);
  private baseEndpoint: string = '';

  constructor(
    protected httpClient: HttpClient,
    protected encrypt: CoffeeEncryptService
  ) {
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
  save<T>(endpoint: string, vo: any, isFormData = false): CoffeeRquestSave<T>{
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRquestSave<T>(this.httpClient, this.encrypt, url, vo, isFormData);
  }

  /**
   * Create a new register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  create<T>(endpoint: string, vo: any, isFormData = false): CoffeeRequestPostPut<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestPostPut<T | T[]>(this.httpClient, this.encrypt, url, vo, false, isFormData);
  }
  
  /**
   * Update register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  update<T>(endpoint: string, vo: any, isFormData = false): CoffeeRequestPostPut<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestPostPut<T | T[]>(this.httpClient, this.encrypt, url, vo, true, isFormData);
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
    return this.downloadFile('PUT', endpoint, model, fileNameWithExtension, isFormData);
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
    return this.downloadFile('POST', endpoint, model, fileNameWithExtension, isFormData);
  }

  /**
   * Downloads a file from the server using either PUT or POST method and saves it with the given file name.
   *
   * @param method - The HTTP method to use ('PUT' or 'POST').
   * @param endpoint - The URL of the endpoint.
   * @param model - The model to send (e.g., { file: file }).
   * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
   * @param isFormData - Whether to send the data as FormData or JSON.
   * @returns An Observable that completes when the file has been downloaded.
   *
   * Usage example:
   * .downloadFile('PUT', 'url', form, 'file.xlsx').subscribe(() => {
   *   console.log('File downloaded successfully');
   * });
   */
  private downloadFile(
    method: 'PUT' | 'POST', 
    endpoint: string, 
    model: any, 
    fileNameWithExtension: string, 
    isFormData = true
  ): Observable<Blob> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? CoffeeUtil.convertModelToFormData(model) : model;
    const requestObservable = method === 'PUT' 
      ? this.httpClient.put(url, data, { responseType: 'blob' }) 
      : this.httpClient.post(url, data, { responseType: 'blob' });

    return requestObservable.pipe<Blob>(
      map((data: Blob) => {
        const downloadUrl = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileNameWithExtension;
        document.body.appendChild(link); // Ensure the link is in the document
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        link.remove(); // Clean up the link element
        return data;
      })
    );
  }
}
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
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
  save<T>(endpoint: string, vo: T, isFormData = false): Observable<T> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? this.convertModelToFormData(vo) : vo;
    return this.httpClient.post<T>(url, data);
  }

   /**
   * Create a new register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  create<T>(endpoint: string, vo: T | T[], isFormData = false): Observable<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    const data = isFormData ? this.convertModelToFormData(vo) : vo;
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
    const data = isFormData ? this.convertModelToFormData(vo) : vo;
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

  private convertModelToFormData(val: any, formData = new FormData(), namespace = ''): FormData {
    if (typeof val !== 'undefined' && val !== null) {
      if (val instanceof Date) {
        formData.append(namespace, val.toISOString());
      } else if (val instanceof Array) {
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          this.convertModelToFormData(
            element,
            formData,
            namespace + '[' + index + ']'
          );
        }
      } else if (typeof val === 'object' && !(val instanceof File)) {
        for (const propertyName in val) {
          if (val.hasOwnProperty(propertyName)) {
            this.convertModelToFormData(
              val[propertyName],
              formData,
              namespace ? namespace + '.' + propertyName : propertyName
            );
          }
        }
      } else if (val instanceof File) {
        formData.append(namespace, val);
      } else {
        formData.append(namespace, val.toString());
      }
    }
    return formData;
  }
}
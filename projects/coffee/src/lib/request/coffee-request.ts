import { inject } from "@angular/core";
import { HttpClient} from "@angular/common/http";
import { CONFIG, IConfig } from "../coffee-config";
import { CoffeeQueryFilter } from "./coffee-query-filter";
import { CoffeeRequestGet } from "./coffee-request-get";
import { CoffeeUtil } from "../shared/coffee-util";
import { CoffeeEncryptService } from "../services/coffee-encrypt.service";
import { CoffeeRquestSave } from "./coffee-request-save";
import { CoffeeRequestPostPut } from "./coffee-request-post-put";
import { CoffeeRequestDelete } from "./coffee-request-delete";
import { CoffeeRequestDownload } from "./coffee-request-download";

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
    return new CoffeeRquestSave<T>(this.httpClient, this.encrypt, url, vo, isFormData, this.config);
  }

  /**
   * Create a new register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  create<T>(endpoint: string, vo: any, isFormData = false): CoffeeRequestPostPut<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestPostPut<T | T[]>(this.httpClient, this.encrypt, url, vo, false, isFormData, this.config);
  }
  
  /**
   * Update register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param vo data to save
   * @param isFormData whether to send the data as form data or json
   */
  update<T>(endpoint: string, vo: any, isFormData = false): CoffeeRequestPostPut<T | T[]> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestPostPut<T | T[]>(this.httpClient, this.encrypt, url, vo, true, isFormData, this.config);
  }

  /**
   * Delete register on a specific endpoint
   * @param endpoint endpoint url "/myendpoint"
   * @param identifier the identifier to use as key for deleting
   */
  delete<bool>(endpoint: string, identifier: number | string): CoffeeRequestDelete<bool> {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestDelete<bool>(this.httpClient, url, identifier);
  }

  /**
   * requests a file from the server.
   *
   * @param endpoint - The url of the endpoint.
   * @param model - The model (e.g { file : file }).
   * @param isFormData whether to send the data as form data or json
   *
   */
  requestDownload(endpoint: string, model: any, isFormData: boolean = false) {
    const url = CoffeeUtil.concatUrl(this.baseEndpoint, endpoint);
    return new CoffeeRequestDownload(this.httpClient, url, model, isFormData);
  }
}
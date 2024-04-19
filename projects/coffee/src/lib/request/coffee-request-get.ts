import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { 
  CoffeeQueryFilter, sortBy, where, 
  whereContains, whereDay, whereMonth, whereYear,
  whereDayAndMonth, whereDayAndYear, whereMonthAndYear, 
  whereDayAndMonthAndYear, whereIn, 
  whereNotIn, whereOr, withQueryParameter,
  Pager, FilterResponse, whereIs
} from ".";

export class CoffeeRequestGet<T> {  
  private apiUrl: string;
  private queryParameters: CoffeeQueryFilter[] = [];
  private authorizationToken: string | null = null;

  constructor(
    private httpClient: HttpClient,
    url: string,
    ...args: CoffeeQueryFilter[]
  ) {
    this.apiUrl = url;
    this.queryParameters = args;
  }

  /**
   * @summary
   * Search values by the exact condition
   * @example 
   * .where('name', '==', 'text')
   * .where((model) => model.name, '==', 'text')
   * .where((model) => model.age, '>', 18)
   */
  where(
    type: ((model: T) => any) | string,
    operator: '==' | '!=' | '>=' | '<=' | '>' | '<',
    value: string | number
  ) {
    this.queryParameters.push(where(type, operator, value));
    return this;
  }

  /**
 * @summary
 * Search values by a boolean type
 * @example 
 * .where('hasStatus', true)
 * .where((model) => model.isValid, false)
 */
  whereIs(
    type: ((model: T) => any) | string,
    value: boolean
  ) {
    this.queryParameters.push(whereIs(type, value));
    return this;
  }

  /**
   * @summary
   * Search values that contains the value, it will use '%like%' on database
   * @example 
   * .whereContains('name', 'text')
   * .whereContains((model) => model.name, 'text')
   */
  whereContains(
    type: ((model: T) => any),
    value: string
  ) {
    this.queryParameters.push(whereContains(type, value));
    return this;
  }

  /**
  * @summary
  * Search value that is in array
  * @example 
  * .whereIn('id', [1,2])
  * .whereIn((model) => model.id, [1,2])
  */
  whereIn(
    type: ((model: T) => any) | string,
    values: string[] | number[]
  ) {
    this.queryParameters.push(whereIn(type, values));
    return this;
  }

  /**
  * @summary
  * Search matches
  * @example 
  * .whereOr([where('name', '==', 'bmx'), whereContains('name', 'a')],[whereDate('createdAt', 'DD-MM-YYYY', '27-10-2022')])
  * 
  * result => (name == 'bmx' AND name LIKE '%a%') OR (createdAt == '27-10-2022')
  */
  whereOr(...filters: CoffeeQueryFilter[][]) {
    this.queryParameters.push(whereOr(...filters));
    return this;
  }

  /**
  * @summary
  * Search value that is not in array
  * @example 
  * .whereNotIn('id', [1,2])
  * .whereNotIn((model) => model.id, [1,2])
  */
  whereNotIn(
    type: ((model: T) => any) | string,
    values: string[] | number[]
  ) {
    this.queryParameters.push(whereNotIn(type, values));
    return this;
  }

  /**
   * @summary
   * Search date by 'day'
   * @example 
   * .whereDay('createdAt', moment())
   * .whereDay((model) => model.createdAt, new Date())
   */
  whereDay = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereDay(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'month'
  * @example 
  * .whereMonth('createdAt', moment())
  * .whereMonth((model) => model.createdAt, new Date())
  */
  whereMonth = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereMonth(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'year'
  * @example 
  * .whereYear('createdAt', moment())
  * .whereYear((model) => model.createdAt, new Date())
  */
  whereYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereYear(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'day' and 'month'
  * @example 
  * .whereYear('createdAt', moment())
  * .whereYear((model) => model.createdAt, new Date())
  */
  whereDayAndMonth = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereDayAndMonth(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'day' and 'year'
  * @example 
  * .whereYear('createdAt', moment())
  * .whereYear((model) => model.createdAt, new Date())
  */
  whereDayAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereDayAndYear(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'month' and 'year'
  * @example 
  * .whereYear('createdAt', moment())
  * .whereYear((model) => model.createdAt, new Date())
  */
  whereMonthAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereMonthAndYear(type, value));
    return this;
  }

  /**
  * @summary
  * Search date by 'day', 'month' and 'year'
  * @example 
  * .whereYear('createdAt', moment())
  * .whereYear((model) => model.createdAt, new Date())
  */
  whereDayAndMonthAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
  ) => {
    this.queryParameters.push(whereDayAndMonthAndYear(type, value));
    return this;
  }

  /**
  * @summary
  * Sort by property
  * @example 
  * .sortBy('createdAt', 'desc')
  * .sortBy((model) => model.createdAt, 'asc')
  */
  sortBy(
    type: ((model: T) => any) | string,
    sort: 'asc' | 'desc'
  ) {
    this.queryParameters.push(sortBy(type, sort));
    return this;
  }

  /**
   * Sets the authorization token to be used in HTTP requests.
   * @param token - The authorization token.
   */
  useAuthorizationToken(token: string): this {
    this.authorizationToken = token;
    return this;
  }

  /**
  * @summary
  * Sets query Parameter
  * @example 
  * .withQueryParameter('name', 'text')
  * .withQueryParameter((model) => model.name, 'text')
  */
  withQueryParameter(
    type: ((model: T) => any) | string,
    value: string | number
  ) {
    this.queryParameters.push(withQueryParameter(type, value));
    return this;
  }

  /**
   * @summary
   * Returns unique single value 
   * @example
   * .returnSingleValue()
   * 
   * result => true || 1 || 'string'
   */
  returnSingleValue() {
    let url = '';

    url = this.parseUrl(url);  
    const headers = this.getHeaders();

    return this.httpClient.get<T>(url, { headers });
  }

  /**
   * @summary
   * Returns unique object of type
   * @example
   * .returnSingleObjectOf(Type)
   * 
   * result => { }
   */
  returnSingleObjectOf(type: new (val: T) => T) {
    let url = '';

    url = this.parseUrl(url);
    const headers = this.getHeaders();

    return this.httpClient.get<T>(url, { headers }).pipe(
      map(data => new type(data))
    );
  }
  
  /**
   * @summary
   * Returns list of pagination type
   * @example
   * .returnPaginationListOf(Type, { currentPage: 1, pageSize: 10 })
   * 
   * result => { data: [], pageer: {} }
   */
  returnPaginationListOf(
    type: new (val: T) => T,
    pagination?: { currentPage: number, pageSize: number }
  ) {
    const url = this.parseUrl('', pagination);
    const headers = this.getHeaders();

    return this.httpClient.get<FilterResponse<T>>(url, { headers }).pipe(
      map(data => {
        const values = data.data.map((entity: any) => {
          return new type(entity) as T
        });
        const pager = new Pager(data.pager);
        return new FilterResponse(values, pager);
      })
    );
  }

  /**
   * @summary
   * Returns list of type
   * 
   * @example
   * .returnListOf(Type)
   * 
   * result => []
   */
  returnListOf(type: new (val: T) => T) {
    const url = this.parseUrl();
    const headers = this.getHeaders();

    return this.httpClient.get<Array<T>>(url, { headers }).pipe(
      map((data: any) => {
        if (Array.isArray(data)) {
          return data.map((entity: any) => {
            return new type(entity)
          });
        }
        else {
          return data.data.map((entity: any) => {
            return new type(entity)
          }) as Array<T>;
        }
      })
    );
  }

  /**
   * Downloads a file from the server and saves it with the given file name.
   *
   * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
   * @returns An Observable that completes when the file has been downloaded.
   *
   * Usage example:
   * .download('file.xlsx').subscribe(() => {
   *   console.log('File downloaded successfully');
   * });
   */
  download(fileNameWithExtension: string) {
    let headers = this.getHeaders();
    headers = headers.set('Content-Type', 'application/octet-stream');

    const url = this.parseUrl();

    return this.httpClient
    .get(url, { headers, responseType: 'blob' })
    .pipe(map((data) => {   
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileNameWithExtension; 
        link.click();
        window.URL.revokeObjectURL(url);
        return data;
      }
    ));
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.authorizationToken) {
      headers = headers.set('Authorization', this.authorizationToken);
    }
    return headers;
  }

  private parseUrl(
    suffixEndpoint?: string,
    pagination?: { currentPage: number, pageSize: number }
  ): string {
    let params = [];
    let url = this.extractLastUrl(this.apiUrl);

    const filters = this.queryParameters.filter(param => param.type == 'filter');
    const sorts = this.queryParameters.filter(param => param.type == 'sort');
    const queryParameters = this.queryParameters.filter(param => param.type == 'parameter');

    if (filters.length) {
      params.push(`filters=${filters.map(filter => filter.expression).join(',')}`);
    }

    if (sorts.length) {
      params.push(`sorts=${sorts.map(sort => sort.expression).join(',')}`);
    }

    if (pagination && pagination.currentPage > -1) {
      params.push(`currentPage=${pagination.currentPage}`);
    }

    if (pagination && pagination.pageSize > -1) {
      params.push(`pageSize=${pagination.pageSize}`);
    }

    if (queryParameters.length) {
      params = params.concat(queryParameters.map(param => param.expression));
    }

    if (!suffixEndpoint?.startsWith("http")) {
      url += suffixEndpoint ?? '';
    }
    else {
      url = suffixEndpoint ?? '';
    }

    if (params.length > 0) {
      return url + '?' + params.join('&');
    }

    return url;
  }

  private extractLastUrl(apiUrl: string): string {
    const urls = apiUrl.split('http').filter(segment => segment.trim() !== '');
    if (urls.length > 0) {
      // Append 'http' back to the URL fragment unless it's already a complete URL segment
      return 'http' + urls[urls.length - 1];
    }
  
    return apiUrl; // Fallback to the original URL if no 'http' was found
  }
}
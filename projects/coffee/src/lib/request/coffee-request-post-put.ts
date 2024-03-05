import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subscription, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CoffeeEncryptService } from '../services/coffee-encrypt.service';
import { CoffeeUtil } from '../shared/coffee-util';

export class CoffeeRequestPostPut<T> {
    protected usePut: boolean = false;
    protected encrypt: boolean = false;
    protected data: T | FormData;
    protected url: string;
    protected vo: T;
    protected queryParameters = Array<String>();

    constructor(
        private httpClient: HttpClient,
        private encryptService: CoffeeEncryptService,
        url: string,
        vo: T,
        usePut: boolean,
        private isFormData: boolean = false,
    ) {
        this.usePut = usePut;
        this.vo = vo;
        this.url = url;
        this.data = isFormData ? CoffeeUtil.convertModelToFormData(vo) : vo;
    }

    /**
    * Marks the request data to be encrypted before sending. This method will only
    * encrypt the data if `isFormData` is set to false, as encryption is not applied
    * to FormData objects. If `isFormData` is true, calling this method will not
    * affect the request data.
    * 
    */
    withEncryption(): CoffeeRequestPostPut<T> {
        this.encrypt = true;
        return this;
    }

        /**
     * Appends a new segment to the current URL of the request.
     * This method allows for dynamic construction of endpoint URLs by concatenating
     * additional path segments. It's particularly useful when you need to build
     * nested or parameterized URLs programmatically.
     * 
     * @param newUrlSegment The new URL segment to be appended to the current URL.
     *
     * Example usage:
     * .withUrlSegment('details').withUrlSegment('123') would transform the URL from "/base/path" to "/base/path/details/123"
     */

    withUrlSegment(newUrlSegment: string): CoffeeRequestPostPut<T> {
        this.url = CoffeeUtil.concatUrl(this.url, newUrlSegment);
        return this;
    }

    /**
     * Adds a query parameter to the request's URL. If multiple query parameters are added,
     * they are concatenated with an '&' character. This method facilitates the dynamic addition
     * of query parameters to the request URL, allowing for complex queries and filtering options
     * to be specified programmatically.
     * 
     * @param key The key of the query parameter to add.
     * @param value The value of the query parameter.
     * @returns {CoffeeRequestPostPut<T>} The instance of CoffeeRequestPostPut for method chaining.
     *
     * Example usage:
     * .withQueryParameter('page', '1').withQueryParameter('limit', '10')
     * would append "?page=1&limit=10" to the URL.
     */
    withQueryParameter(key: string, value: string): CoffeeRequestPostPut<T> {
        this.queryParameters.push(`${key}=${value}`);
        return this;
    }

    /**
     * Converts the request's data to FormData. This conversion is suitable for scenarios requiring
     * file uploads or when the content type is multipart/form-data. Once converted, the data is 
     * handled as FormData for the outgoing request.
     * 
     * This method is particularly useful for dynamically preparing the payload for file uploads or
     * when interacting with APIs that expect multipart/form-data content types. It simplifies the 
     * process of adjusting the payload format to meet specific endpoint requirements.
     * 
     * Note: This conversion is one-way and designed for objects or data structures that can be 
     * appropriately represented as FormData. Attempting to convert non-object data (e.g., a plain 
     * string) may not yield the expected FormData structure and could require pre-processing or 
     * manual adjustment of the data prior to conversion.
     */
    withFormData(): CoffeeRequestPostPut<T> {
        this.isFormData = true;
        this.data = CoffeeUtil.convertModelToFormData(this.vo);
        return this;
    }

    /**
     * Prepares and returns an Observable for the HTTP request, allowing further chaining with RxJS operators.
     * 
     * @returns {Observable<T>} An Observable that emits the result of the HTTP request.
     */
    prepare(): Observable<T> {
        const requestData = this.encrypt ? from(this.encryptDataBeforeSend()) : from([this.data]);
        return requestData.pipe(
            switchMap(data => {
                if(this.queryParameters.length) {
                    this.url = `${this.url}?${this.queryParameters.join("&")}`;
                }

                let headers = new HttpHeaders();
                if (this.encrypt && !(data instanceof FormData) && data != false) {
                    headers = headers.set('encrypted', 'true');
                }
                else {
                    data = this.data;
                }
                
                if (this.usePut) {
                    return this.httpClient.put<T>(this.url, data, { headers });
                } else {
                    return this.httpClient.post<T>(this.url, data, { headers });
                }
            })
        );
    }
    
    /**
     * Subscribes to the observable created by the HTTP request, initiating the request process.
     * The request is made using HTTP POST unless useHttpPutWhenId has been called and the data object has an 'id' property greater than 0.
     * If encryptData has been called, the data is encrypted before sending.
     * 
     * @param observerOrNext A partial Observer or a next function to handle the emitted value.
     * @returns A subscription to the observable representing the request.
     */
    subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | undefined): Subscription {
        return this.prepare().subscribe(observerOrNext);
    }

    /**
     * Encrypts the data before sending if encryption has been enabled.
     * If the data is FormData or encryption is not enabled, the original data is returned unchanged.
     * 
     * @returns A promise resolving to the encrypted data, the original data, or false if encryption fails.
     */
    private async encryptDataBeforeSend(): Promise<{ k: string, d: string } | false | T | FormData> {
        if (!this.encrypt || this.isFormData) {
            return this.data;
        }
        const encryptedData = await this.encryptService.encrypt(this.data);
        return encryptedData;
    }
}
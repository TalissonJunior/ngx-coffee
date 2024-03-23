import { HttpClient } from '@angular/common/http';
import { Observable, Observer, Subscription } from 'rxjs';
import { CoffeeUtil } from '../shared/coffee-util';

export class CoffeeRequestDelete<T> {
    protected data: T | FormData;
    protected url: string;
    protected queryParameters = Array<String>();
    protected identifier: number | string;

    constructor(
        private httpClient: HttpClient,
        url: string,
        identifier: number | string
    ) {
        this.url = url;
        this.identifier = identifier;
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

    withUrlSegment(newUrlSegment: string): CoffeeRequestDelete<T> {
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
    withQueryParameter(key: string, value: string): CoffeeRequestDelete<T> {
        this.queryParameters.push(`${key}=${value}`);
        return this;
    }

    /**
     * Prepares and returns an Observable for the HTTP request, allowing further chaining with RxJS operators.
     * 
     * @returns {Observable<T>} An Observable that emits the result of the HTTP request.
     */
    prepare(): Observable<T> {
        this.url = CoffeeUtil.concatUrl(this.url, this.identifier);

        if(this.queryParameters.length) {
            this.url = `${this.url}?${this.queryParameters.join("&")}`;
        }

        return this.httpClient.delete<T>(this.url);
    }
    
    /**
     * Subscribes to the observable created by the HTTP request, initiating the request process.
     * The request is made using HTTP DELETE.
     * 
     * @param observerOrNext A partial Observer or a next function to handle the emitted value.
     * @returns A subscription to the observable representing the request.
     */
    subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | undefined): Subscription {
        return this.prepare().subscribe(observerOrNext);
    }
}
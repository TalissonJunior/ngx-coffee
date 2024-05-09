import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import {
    CoffeeQueryFilter, withQueryParameter
} from ".";
import { Observable } from "rxjs";
import { CoffeeUtil } from "../shared/coffee-util";

export class CoffeeRequestDownload<T> {
    private apiUrl: string;
    private authorizationToken: string | null = null;
    private queryParameters: CoffeeQueryFilter[] = [];

    constructor(
        private httpClient: HttpClient,
        endpoint: string,
        private model: T,
        private isFormData: boolean = false
    ) {
        this.apiUrl = endpoint;
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
     * Downloads a file from the server and saves it with the given file name.
     *
     * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
     * @param useJsonContentType - Determines if 'application/json' should be used as the Content-Type.
     * @returns An Observable that completes when the file has been downloaded.
     *
     * Usage example:
     * .downloadFileUsingPut('file.xlsx').subscribe(() => {
     *   console.log('File downloaded successfully');
     * });
     */
    downloadFileUsingPut(fileNameWithExtension: string, useJsonContentType: boolean = false): Observable<Blob> {
        return this.downloadFile('PUT', fileNameWithExtension, useJsonContentType);
    }


    /**
     * Downloads a file from the server and saves it with the given file name.
     *
     * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
     * @param useJsonContentType - Determines if 'application/json' should be used as the Content-Type.
     * @returns An Observable that completes when the file has been downloaded.
     *
     * Usage example:
     * .downloadFileUsingPost('file.xlsx').subscribe(() => {
     *   console.log('File downloaded successfully');
     * });
     */
    downloadFileUsingPost(fileNameWithExtension: string, useJsonContentType: boolean = false): Observable<Blob> {
        return this.downloadFile('POST', fileNameWithExtension, useJsonContentType);
    }

    /**
    * Downloads a file from the server using either PUT or POST method and saves it with the given file name.
    *
    * @param method - The HTTP method to use ('PUT' or 'POST').
    * @param fileNameWithExtension - The desired file name, including the file extension (e.g., 'file.xlsx').
    *@param useJsonContentType - Determines if 'application/json' should be used as the Content-Type.
    * @returns An Observable that completes when the file has been downloaded.
    *
    * Usage example:
    * .downloadFile('PUT', 'url', form, 'file.xlsx').subscribe(() => {
    *   console.log('File downloaded successfully');
    * });
    */
    private downloadFile(
        method: 'PUT' | 'POST',
        fileNameWithExtension: string,
        useJsonContentType: boolean = false
    ): Observable<Blob> {
        let headers = this.getHeaders(useJsonContentType);

        const url = this.parseUrl();
        const data = this.isFormData ? CoffeeUtil.convertModelToFormData(this.model) : this.model;

        const requestObservable = method === 'PUT'
            ? this.httpClient.put(url, data, { headers, responseType: 'blob' })
            : this.httpClient.post(url, data, { headers, responseType: 'blob' });

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

    private getHeaders(useJsonContentType: boolean): HttpHeaders {
        let headers = new HttpHeaders();
        if (this.authorizationToken) {
            headers = headers.set('Authorization', this.authorizationToken);
        }

        const contentType = useJsonContentType ? 'application/json' : 'application/octet-stream';
        headers = headers.set('Content-Type', contentType);

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
import { HttpClient } from "@angular/common/http";
import { catchError, EMPTY, interval, map, mergeMap, Observable, of, startWith, take, tap, throwError } from "rxjs";
import { IConfig } from "../coffee-config";
import { CoffeeAuth } from "./models/coffee-auth";
import { CoffeeSocialRequest } from "./social-request/coffee-social-request";
import { CoffeeUtil } from "../shared/coffee-util";
import { CoffeeAuthResponse } from "./models/coffee-auth-reponse";
import { AuthUtils } from "./auth-utils";

export class CoffeeAuthRequest<T> {
    private socialRequest: CoffeeSocialRequest;
    private currentUser: T | null;
    private currentUserCache$?: Observable<T>;
    private currentUserLock: boolean = false;
    private queryParams: { [key: string]: string } = {};

    constructor(
        private config: IConfig,
        private httpClient: HttpClient,
        private type?: new (val: any) => T
    ) {
    }

    get social(): CoffeeSocialRequest {
        if (!this.socialRequest) {
            this.socialRequest = new CoffeeSocialRequest(this.config, this.httpClient);
        }

        return this.socialRequest;
    }

    /**
     * Chains a query parameter to the request made by the `getCurrentUser` method.
     *
     * This method allows you to add additional query parameters to the request URL
     * when calling `getCurrentUser`. The parameters are stored in the instance and
     * appended to the URL during the API call.
     *
     * @param {string} key - The name of the query parameter.
     * @param {string} value - The value of the query parameter.
     *
     * @returns {CoffeeAuthRequest<T>} - The instance of the class, allowing for method chaining.
     *
     * @example
     * // Adds a query parameter 'exampleKey' with the value 'exampleValue' to the request.
     * authRequest.withQueryParameter('exampleKey', 'exampleValue');
     *
     * @see getCurrentUser
     */
    withQueryParameter(key: string, value: string): CoffeeAuthRequest<T> {
        this.queryParams[key] = value;
        return this;
    }

    /**
     * Set a value in the storage, associated with a key and the logged-in user.
     *
     * This method first retrieves the current user and then sets the provided value
     * in the storage, associated with the provided key and the user.
     *
     * @param {string} key - The key with which the value will be associated in the storage.
     * @param {any} value - The value to be stored.
     *
     * @returns {Observable<void>} - An Observable that completes when the value has been set.
     */
    setStorageValue(key: string, value: any): Observable<void> {
        return new Observable(observer => {
            this.getCurrentUser().subscribe(() => {
                AuthUtils.setUserProperty(this.currentUser, key, value);
                observer.next();
                observer.complete();
            });
        });
    }

    /**
     * Retrieve a value from the storage, based on a key and the logged-in user.
     *
     * This method first retrieves the current user and then gets the value
     * associated with the provided key from the storage.
     *
     * @param {string} key - The key whose associated value is to be retrieved.
     *
     * @returns {Observable<any>} - An Observable that emits the retrieved value.
     */
    getStorageValue(key: string): Observable<any> {
        return new Observable(observer => {
            this.getCurrentUser().subscribe(() => {
                const value = AuthUtils.getUserProperty(this.currentUser, key);
                observer.next(value);
                observer.complete();
            });
        });
    }

    /**
     * Authenticate using login and password.
     *
     * This method sends a POST request to the "user/authenticate" endpoint with
     * the provided authentication data. The endpoint is expected to return an object
     * containing the user data and a token.
     *
     * @param {CoffeeAuth} auth - The authentication data, containing login and password.
     *
     * @returns {Observable<T>} - An Observable that emits the authenticated user data.
     */
    siginWithLoginPassword(auth: CoffeeAuth): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";

        return this.httpClient
            .post<T>(CoffeeUtil.concatUrl(baseEndPoint, 'user/authenticate'), auth)
            .pipe(
                map(data => {
                    const typedData = (data as CoffeeAuthResponse<T>);

                    AuthUtils.saveToken(typedData.token);
                    const user = this.type ? new this.type(typedData.user) : typedData.user as T;
                    return user;
                })
            );
    }

     /**
     * Authenticate by code, it will use "user" 
     * endpoint(POST) and concatenate with the url, 
     * this endpoint must return { user: ..., token: .... }
     */
     siginWithCode(url: string, code: string): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";

        return this.httpClient
            .post<T>(CoffeeUtil.concatUrl(CoffeeUtil.concatUrl(baseEndPoint, 'user'), url) + "?" + code, null)
            .pipe(
                map(data => {
                    const typedData = (data as CoffeeAuthResponse<T>);

                    AuthUtils.saveToken(typedData.token);
                    const user = this.type ? new this.type(typedData.user) : typedData.user as T;
                    return user;
                })
            );
    }

    /**
     * Change the password of the current user.
     *
     * This method sends a PUT request to the "user/changepassword" endpoint with
     * the new password. The endpoint is expected to update the password of the
     * currently authenticated user.
     *
     * @param {string} newPassword - The new password for the user.
     *
     * @returns {Observable<T>} - An Observable that emits the current user data.
     */
    changePassword(newPassword: string): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";
        const url = CoffeeUtil.concatUrl(baseEndPoint, 'user/changepassword');

        return this.httpClient
            .put<T>(url, CoffeeUtil.convertModelToFormData(newPassword))
            .pipe(
                map(() => {
                    return this.currentUser as any;
                })
            );
    }


    /**
     * Check if the current user is logged in.
     *
     * This method checks if a token exists and if the current user data is available,
     * indicating that a user is logged in.
     *
     * @returns {Observable<boolean>} - An Observable that emits `true` if a user is logged in, otherwise `false`.
     */
    isLoggedIn(): Observable<boolean> {
        const hasToken = AuthUtils.getToken() != null ? true : false;

        return new Observable(observer => {
            if (!hasToken) {
                observer.next(false);
                observer.complete();
                return;
            }

            if (!this.currentUser) {
                this.getAuthInfo().subscribe({
                    next: user => {
                        if (!user) {
                            observer.next(false);
                        } else {
                            observer.next(true);
                        }
                        observer.complete();
                    },
                    error: () => {
                        observer.next(false);
                        observer.complete();
                    }
                });
            } else {
                observer.next(true);
                observer.complete();
            }
        });
    }

    /**
     * Retrieve the current logged-in user data.
     *
     * This method retrieves the data of the current logged-in user. If the user data
     * is cached, it returns the cached data. Otherwise, it sends a GET request to
     * the "user/authenticated/info" endpoint to retrieve the user data.
     *
     * @returns {Observable<T | null>} - An Observable that emits the current user data, or `null` if no user is logged in.
     */
    getCurrentUser(): Observable<T | null> {
        if (!AuthUtils.getToken()) {
            return of(null);
        }
    
        if (this.currentUser) {
            return of(this.currentUser);
        }
    
        if (this.currentUserCache$) {
            return this.currentUserCache$;
        }
    
        if (!this.currentUserLock) {
            this.currentUserLock = true;
    
            this.currentUserCache$ = this.getAuthInfo().pipe(
                tap((user) => {
                    this.currentUser = user;
                    this.currentUserLock = false;
                    this.currentUserCache$ = undefined;
                }),
                catchError((err) => {
                    this.currentUserCache$ = undefined;
                    this.currentUserLock = false;
                    this.currentUser = null;
                    return throwError(err);
                })
            );
    
            return this.currentUserCache$;
        } else {
            // If another request is in progress, wait for it to complete
            return interval(50).pipe(
                startWith(0),
                mergeMap(() => {
                    if (this.currentUser) {
                        return of(this.currentUser);
                    } else {
                        return EMPTY;
                    }
                }),
                take(1)
            );
        }
    }

    /**
     * Refresh the current logged-in user data.
     *
     * This method clears the cached user data and retrieves it again, ensuring that
     * the client has the most up-to-date user data.
     *
     * @returns {Observable<T | null>} - An Observable that emits the refreshed user data, or `null` if no user is logged in.
     */
    refreshCurrentUser(): Observable<T | null> {
        this.currentUser = null; // Reset the current user
    
        return this.getCurrentUser();
    }

    /**
     * Log out the current user.
     *
     * This method clears the stored tokens and the cached user data, effectively
     * logging out the user.
    */
    logout(): void {
        AuthUtils.clearTokens();
        this.currentUser = null;
    }

    private getAuthInfo(): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";
        let url = CoffeeUtil.concatUrl(baseEndPoint, 'user/authenticated/info');
    
        // Append query parameters to the URL
        const queryString = Object.keys(this.queryParams)
            .map(key => `${key}=${encodeURIComponent(this.queryParams[key])}`)
            .join('&');

        if (queryString) {
            url = `${url}?${queryString}`;
        }
    
        return this.httpClient
            .get<T>(url)
            .pipe(
                map(data => {
                    this.currentUser = this.type ? new this.type(data) : data as T;

                    // try to restore save data
                    try {
                        const keys = Object.keys(this.currentUser as any);

                        for (const key of keys) {
                            const storageValue =  AuthUtils.getUserProperty(this.currentUser, key);

                            if(!storageValue) {
                                continue;
                            }

                            (this.currentUser as any)[key] = storageValue;
                            this.currentUser = this.type ? new this.type(this.currentUser) : this.currentUser as T;
                        }
                    }
                    catch {}
                  
                    return this.currentUser;
                })
            );
    }
}
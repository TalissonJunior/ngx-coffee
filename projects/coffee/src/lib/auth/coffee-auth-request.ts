import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { IConfig } from "../coffee-config";
import { CoffeeAuth } from "./models/coffee-auth";
import { CoffeeSocialRequest } from "./social-request/coffee-social-request";
import { CoffeeUtil } from "../shared/coffee-util";
import { CoffeeAuthResponse } from "./models/coffee-auth-reponse";
import { AuthUtils } from "./auth-utils";

export class CoffeeAuthRequest<T> {
    private socialRequest: CoffeeSocialRequest;
    private currentUser: T | null;

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
     * Set value to the storage, based on the key and the logged user
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
     * Get value from storage, based on the key and the logged user 
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
     * Authenticate by Login and password, it will use "user/authenticate" 
     * endpoint, this endpoint must return { user: ..., token: .... }
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
     * Verify if the current user is logged in
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
     * Returns the current logged user info or null if user is not logged in
     */
    getCurrentUser(): Observable<T | null> {
        return new Observable((resolve) => {
            if (!AuthUtils.getToken()) {
                resolve.next(null);
                resolve.complete();
            }

            if (this.currentUser) {
                resolve.next(this.currentUser);
                resolve.complete();
            }

            this.getAuthInfo()
                .subscribe({
                    next: (snapshot) => {
                        resolve.next(snapshot);
                        resolve.complete();
                    },
                    error: () => {
                        resolve.next(null);
                        resolve.complete();
                    },
                })
        });
    }

    /**
     * Removes logged user data
     */
    logout(): void {
        AuthUtils.clearTokens();
        this.currentUser = null;
    }

    private getAuthInfo(): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";

        return this.httpClient
            .get<T>(CoffeeUtil.concatUrl(baseEndPoint, 'user/authenticated/info'))
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
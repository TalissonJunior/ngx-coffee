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
     * Authenticate by Login and password, it will use "auth/authenticate" 
     * endpoint, this endpoint must return { user: ..., token: .... }
     */
    siginWithLoginPassword(auth: CoffeeAuth): Observable<T> {
        const baseEndPoint = this.config ? this.config.baseApiUrl : "";

        return this.httpClient
            .post<T>(CoffeeUtil.concatUrl(baseEndPoint, 'auth/authenticate'), auth)
            .pipe(
                map(data => {
                    const typedData = (data as CoffeeAuthResponse<T>);

                    AuthUtils.saveToken(typedData.token);
                    this.currentUser = this.type ? new this.type(typedData.user) : typedData.user as T;

                    return this.currentUser;
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

                    return this.currentUser;
                })
            );
    }
}
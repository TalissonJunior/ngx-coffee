import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IConfig } from "../../coffee-config";
import { AuthUtils } from "../auth-utils";
import { MsalService } from "@azure/msal-angular";
import { CoffeeRequest } from "../../request/coffee-request";
import { CoffeeAuthSocial } from "../models/coffee-auth-social";
import { CoffeeUtil } from "../../shared/coffee-util";

export class CoffeeSocialRequest {
    private linkedInAuthApiUrl = "https://www.linkedin.com/oauth/v2/authorization";
    private googleAuthApiUrl = "https://accounts.google.com/o/oauth2/auth";
    private microsoftPhotoUrl = "https://graph.microsoft.com/v1.0/me/photo/$value";

    constructor(
        private config: IConfig, 
        private httpClient: HttpClient,
        private request: CoffeeRequest,
        private msalService: MsalService
    ) { }

    // GOOGLE AUTH METHODS

    /**
     * Initiates the Google sign-in process by redirecting the user to the Google OAuth2 authorization page.
     *
     * After the user is redirected back to your application, make sure to call `validateGoogleRedirect()`
     * to exchange the authorization code for an access token and complete the authentication process.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the window is opened or user is redirected successfully.
     *
     * @example
     * this.coffeeSocialRequest.signInWithGoogle().subscribe({
     *     next: () => console.log('Google sign-in initiated:', success),
     *     error: () => console.log('Google sign-in initiation failed:', error)
     * });
     * 
     * // After redirection, call the following in your redirect handling code:
     * this.coffeeSocialRequest.validateGoogleRedirect().subscribe({
     *     next: () => console.log('You are now authenticated:', success),
     *     error: () => console.log('Token validation failed:', error)
     * });
     */
    signInWithGoogle(): Observable<boolean> {
        if (!this.config?.auth?.google) {
            throw Error(
                CoffeeUtil.formatCoffeeLogMessage(
                    'Google Authentication Configuration Missing: Ensure that the "auth"' +
                    ' configuration property is provided when utilizing "CoffeeModule.forRoot({})"' +
                    ' and that it includes "google" authentication settings.'
                )
            );
        }

        let url = `${this.googleAuthApiUrl}?`;
        url += `response_type=code&`;
        url += `client_id=${this.config.auth.google.clientId}&`;
        url += `scope=${Array.isArray(this.config.auth.google.scope) ? this.config.auth.google.scope.join(' ') : (this.config.auth.google.scope ?? 'email profile')}&`;
        url += `redirect_uri=${this.config.auth.google.redirectUri}&`;
        url += `access_type=${this.config.auth.google.accessType ?? 'online'}&`;

        if (this.config.auth.google.prompt) {
            url += `prompt=${this.config.auth.google.prompt}&`;
        }

        if (this.config.auth.google.state) {
            url += `state=${this.config.auth.google.state}&`;
        }

        return new Observable((observer) => {
            if (!this.config.auth?.google?.openInPopup) {
                window.open(url, '_self');
                observer.next(true);
                observer.complete();
                return;
            }

            const win = window.open(url, '_blank', `scrollbars=yes,resizable=yes,width=500,height=500`) as any;
            const timer = setInterval(() => { 
                if(win.closed) {
                    const token = (win as any).googleToken;
                    clearInterval(timer);

                    if(token) {
                        AuthUtils.saveToken(token);
                        observer.next(true);
                        observer.complete();
                    }
                    else {
                        observer.error();
                        observer.complete();
                    }
                }
            }, 500);
        });
    }

    /**
     * Validates the Google sign-in by exchanging the received `code` for an access token,
     * then submitting the token to backend to handle the Google authentication process.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the authentication is successful.
     *
     * @example
     * validateGoogleRedirect().subscribe({
     *     next: () => console.log('You are now authenticated:', success),
     *     error: () => console.log('Token validation failed:', error)
     * });
     */
    validateGoogleRedirect(): Observable<boolean> {
        return new Observable((observer) => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                const url = this.config?.baseApiUrl;
                const body = { authorizationCode: code };

                this.httpClient.post<string>(`${url}/coffee/auth/google`, body)
                    .subscribe({
                        next: (data: any) => {
                            // Check if data is a string and parse it if necessary
                            if (typeof data === 'string') {
                                data = JSON.parse(data);
                            }
                            
                            (window as any).googleToken = data.token;
                            AuthUtils.saveToken(data.token);
                            observer.next(true);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                            observer.complete();
                        }
                    });
            } else {
                observer.error('No Google authorization code found in the URL.');
                observer.complete();
            }
        });
    }

    // LINKEDIN AUTH METHODS

     /**
     * Initiates the LinkedIn sign-in process by redirecting the user to the LinkedIn OAuth2 authorization page.
     *
     * After the user is redirected back to your application, make sure to call `validateLinkedInRedirect()`
     * to exchange the authorization code for an access token and complete the authentication process.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the window is opened or user is redirected successfully.
     *
     * @example
     * this.coffeeSocialRequest.signInWithLinkedIn().subscribe({
     *     next: () => console.log('LinkedIn sign-in initiated:', success),
     *     error: () => console.log('LinkedIn sign-in initiation failed:', error)
     * });
     * 
     * // After redirection, call the following in your redirect handling code:
     * this.coffeeSocialRequest.validateLinkedInRedirect().subscribe({
     *     next: () => console.log('You are now authenticated:', success),
     *     error: () => console.log('Token validation failed:', error)
     * });
     */
     signInWithLinkedIn(): Observable<boolean> {
        if(!this.config?.auth?.linkedIn) {
            throw Error(
                'LinkedIn Authentication Configuration Missing: Ensure that the "auth"' +
                ' configuration property is provided when utilizing "CoffeeModule.forRoot({})"'+
                ' and that it includes "linkedIn" authentication settings.'
            );
        }

        let url = `${this.linkedInAuthApiUrl}?`;
        url += `response_type=code&`;
        url += `client_id=${this.config.auth.linkedIn.clientId}&`;
        url += `scope=${this.config.auth.linkedIn.scope ?? 'r_emailaddress,r_liteprofile'}&`;
        url += `redirect_uri=${this.config.auth.linkedIn.redirectUri}`;

        return new Observable((observer) => {

            if(!this.config.auth?.linkedIn?.openInPopup) {
                window.open(url, '_self');
                observer.next(true);
                observer.complete();
                return;
            }

            const win = window.open(url, '_blank', `scrollbars=yes,resizable=yes,width=500,height=500`) as any;
            const timer = setInterval(() => { 
                if(win.closed) {
                    const token = (win as any).linkCode;
                    clearInterval(timer);

                    if(token) {
                        AuthUtils.saveToken(token);
                        observer.next(true);
                        observer.complete();
                    }
                    else {
                        observer.error();
                        observer.complete();
                    }
                }
            }, 500);
        })
       
    }

    /**
     * Validates the LinkedIn sign-in by exchanging the received `code` for an access token,
     * then submitting the token to backend to handle the LinkedIn authentication process.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the authentication is successful.
     *
     * @example
     * validateLinkedInRedirect().subscribe({
     *     next: () => console.log('You are now authenticated:', success),
     *     error: () => console.log('Token validation failed:', error)
     * });
     */
    validateLinkedInRedirect(): Observable<boolean> {
        return new Observable((observer) => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                const url = this.config?.baseApiUrl;
                const body = { authorizationCode: code };

                this.httpClient.post<string>(`${url}/coffee/auth/linkedin`, body)
                    .subscribe({
                        next: (data: any) => {  
                            // Check if data is a string and parse it if necessary
                            if (typeof data === 'string') {
                                data = JSON.parse(data);
                            }

                            (window as any).linkCode = data.token;
                            AuthUtils.saveToken(data.token);
                            observer.next(true);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                            observer.complete();
                        }
                    });
            } else {
                observer.error('No LinkedIn authorization code found in the URL.');
                observer.complete();
            }
        });
    }

    // MICROSOFT AUTH METHODS

    /**
     * Initiates the Microsoft sign-in process using the MSAL service. This method
     * handles the entire flow of authenticating with Microsoft, including opening
     * a popup for user consent, retrieving the user profile, and handling any errors
     * that might occur during the process.
     */
    signInWithMicrosoft(): Observable<boolean>  {
        return new Observable((observer) => {
            this._signInWithMicrosoft().subscribe({
                next: (model) => {
                    this.submitSocialMediaData('Microsoft', model)
                    .subscribe({
                        next: () => {
                            observer.next(true);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                            observer.complete();
                        }
                    });
                },
                error: (error) => {
                    observer.error(error);
                    observer.complete();
                }
            });
        });
    }

    /**
     * A private method that performs the Microsoft login operation. It uses the MSAL
     * service to open a login popup and requests access tokens for the specified scopes.
     * On successful login, it fetches the user's profile picture from Microsoft Graph API.
     */
    private _signInWithMicrosoft(): Observable<CoffeeAuthSocial> {
        return new Observable((observer) => {

            let model = new CoffeeAuthSocial();
            const scopes = this.config.auth?.microsoft?.scopes ?? ['User.Read', 'User.ReadBasic.All'];
        
            this.msalService.instance.handleRedirectPromise()
            .then(() => {
                this.msalService.loginPopup({
                    scopes: scopes
                }).subscribe({
                    next: (popupResult) => {

                        model = {
                            id: popupResult.account.tenantId,
                            email: popupResult.account.username,
                            name: popupResult.account.name ?? '',
                            token: popupResult.account.idToken ?? '',
                        }

                        const accessTokenRequest = {
                            scopes: scopes,
                            account: popupResult.account
                        };


                        // GETTING TOKEN TO GET USER PROFILE IMAGE
                        this.msalService.acquireTokenSilent(accessTokenRequest)
                        .subscribe({
                            next: (response) => {
                                const headers = {
                                    Authorization: `Bearer ${response.accessToken}`
                                };
                        
                                this.httpClient.get(
                                    this.microsoftPhotoUrl, 
                                    { headers, responseType: 'blob' }
                                )
                                .subscribe({
                                    next: (image) => {
                                        model.image = image;
                                    },
                                    complete: () => {
                                        observer.next(model);
                                        observer.complete();
                                    }
                                });
                            },
                            // FAILED TO ACQUIRE TOKEN
                            error: () => {
                                observer.next(model);
                                observer.complete();
                            }
                        });
                    },
                    // FAILED TO OPEN POPUP
                    error: (error) => {
                        observer.error({
                            code: "POPUP_AUTH_FAILURE",
                            error: error,
                            message: "Authentication popup failed to open. Please ensure " +
                            "Microsoft authentication is correctly configured in CoffeeModule," +
                            " and verify that the provided client ID and tenant information are accurate."
                        });
                        observer.complete();
                    }
                });

            })
            .catch((error) => {
                observer.error({
                    code: "REDIRECT_FAILURE",
                    error: error,
                    message: "Authentication popup redirect failed. Please ensure " +
                    "Microsoft authentication is correctly configured in CoffeeModule," +
                    " and verify that the provided client ID and tenant information are accurate."
                });
                observer.complete();
            });
        });
    }

    // COMMON SUBMISSION METHOD

    /**
     * Handles the submission of social media authentication data to the server.
     * This method is responsible for sending the user's information, including
     * their profile picture, to a designated server endpoint for either Google,
     * Microsoft, or LinkedIn sign-in processes.
     */
    private submitSocialMediaData(
        type: 'Google' | 'Microsoft' | 'LinkedIn', 
        user: CoffeeAuthSocial
    ): Observable<boolean> {
        
        return new Observable((observer) => {
            let file = null;
        
            if(user.image != null) {
                file = new File(
                    [user.image], 
                    `${user.id}.png`, 
                    { 
                        type: user.image.type, 
                        lastModified: new Date().getTime() 
                    }
                );
            }
        
            this.request.save(`user/socialmedia/${type}`, {
                'name': user.name,
                'email': user.email,
                'photoUrl': user.photoUrl,
                'serverAuthCode': user.token,
                'photo': {
                    file: file
                },
                'id': user.id
                }, true
            )
            .subscribe({
                next: (snapshot: any) => {
                    if(snapshot?.token) {
                        AuthUtils.saveToken(snapshot.token);
                    }

                    observer.next(true);
                    observer.complete();
                },
                error: (error) => {
                    observer.error({
                        code: 'SOCIAL_MEDIA_AUTH_ENDPOINT_ERROR',
                        error: error,
                        message: `There was an issue with the social media authentication`+
                        ` process for ${type}. Ensure the endpoint "user/socialmedia/${type}"` +
                        ` is properly configured and accessible. This error may also occur if`+
                        ` the server-side handling of the authentication data for ${type} is not set up correctly.`
                    });
                    observer.complete();
                },
            });
        });
    }
}
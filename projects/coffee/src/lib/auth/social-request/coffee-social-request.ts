import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { IConfig } from "../../coffee-config";
import { AuthUtils } from "../auth-utils";
import { MsalService } from "@azure/msal-angular";
import { CoffeeRequest } from "../../request/coffee-request";
import { CoffeeAuthSocial } from "../models/coffee-auth-social";

export class CoffeeSocialRequest {
    private linkedInAuthApiUrl = "https://www.linkedin.com/oauth/v2/authorization";
    private microsoftPhotoUrl = "https://graph.microsoft.com/v1.0/me/photo/$value";
    
    constructor(
        private config: IConfig, 
        private httpClient: HttpClient,
        private request: CoffeeRequest,
        private msalService: MsalService
    ) { }

    /**
     * Initiates the Microsoft sign-in process using the MSAL service. This method
     * handles the entire flow of authenticating with Microsoft, including opening
     * a popup for user consent, retrieving the user profile, and handling any errors
     * that might occur during the process.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the sign-in process is successful.
     */
    signInWithMicrosoft(): Observable<boolean>  {
        return new Observable((observer) => {
            this._signInWithMicrosoft().subscribe({
                next: (model) => {
                    this._signInWithSocialMedia('Microsoft', model)
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
            })
        });
    }

    /**
     * Initiates the LinkedIn sign-in process.
     * Depending on the configuration, it either redirects the user to the LinkedIn authorization page
     * or opens it in a new popup window.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the window is opened or user is redirected successfully.
     * 
     * @example
     * signInWithLinkedIn().subscribe(
     *     success => console.log('Sign-in initiated:', success),
     *     error => console.log('Sign-in initiation failed:', error)
     * );
     * 
     * @see {@link https://learn.microsoft.com/pt-br/linkedin/shared/authentication/authorization-code-flow}
     */
    signInWithLinkedIn(): Observable<boolean> {
        if(!this.config?.auth?.linkedIn) {
            throw Error('LinkedIn Authentication Configuration Missing: Ensure that the "auth" configuration property is provided when utilizing "CoffeeModule.forRoot({})" and that it includes "linkedIn" authentication settings.');
        }

        let url = `${this.linkedInAuthApiUrl}?`;
        url += `response_type=code&`;
        url += `client_id=${this.config.auth.linkedIn.clientId}&`;
        url += `scope=${this.config.auth.linkedIn.scope ?? 'r_emailaddress,r_liteprofile'}&`;
        url += `redirect_uri=${this.config.auth.linkedIn.redirectUrl}`;

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
     * which is then stored for subsequent API requests.
     *
     * @param {string} code - The authorization code received from LinkedIn.
     * @param {any} [bodyData=null] - Optional. Additional body data to send in the request.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the token is successfully obtained and saved.
     * 
     * @example
     * validateLinkedInSignIn(code).subscribe(
     *     success => console.log('Token validated:', success),
     *     error => console.log('Token validation failed:', error)
     * );
     */
    validateLinkedInSignIn(code: string, bodyData: any = null): Observable<boolean> {
        const url = this.config?.baseApiUrl;
        bodyData ? bodyData : { login: 'linkedIn', password: 'linkedIn' };
        
        return this.httpClient!.post<string>(`${url}/user/authenticate?linkedInCode=` + code, bodyData) 
        .pipe(
            map((data: any) => {
                (window as any).linkCode = data.token;
                AuthUtils.saveToken(data.token);
                return true;
            })
        );
    }

    /**
     * A private method that performs the Microsoft login operation. It uses the MSAL
     * service to open a login popup and requests access tokens for the specified scopes.
     * On successful login, it fetches the user's profile picture from Microsoft Graph API.
     *
     * @returns {Observable<CoffeeAuthSocial>} - An observable that emits the authenticated user's data.
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

    /**
     * Handles the submission of social media authentication data to the server.
     * This method is responsible for sending the user's information, including
     * their profile picture, to a designated server endpoint for either Google or
     * Microsoft sign-in processes.
     *
     * @param {string} type - The type of social media ('Google' or 'Microsoft').
     * @param {CoffeeAuthSocial} user - The user's authentication data.
     *
     * @returns {Observable<boolean>} - An observable that emits `true` if the data is successfully submitted.
     */
    private _signInWithSocialMedia(
        type: 'Google' | 'Microsoft', 
        user: CoffeeAuthSocial
    ): Observable<boolean> {
        
        return new Observable((observer) => {
            var file = null;
        
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
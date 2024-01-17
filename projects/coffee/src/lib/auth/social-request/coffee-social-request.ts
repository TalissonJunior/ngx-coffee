import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { IConfig } from "../../coffee-config";
import { AuthUtils } from "../auth-utils";

export class CoffeeSocialRequest {
    private linkedInAuthApiUrl = "https://www.linkedin.com/oauth/v2/authorization";
    
    constructor(
        private config: IConfig, 
        private httpClient: HttpClient
    ) { }

    /*signInWithSocialMedia(type: 'Google' | 'Microsoft', user: SocialUser, blob: Blob): void {
        this.isLoading = true;
    
        var file = null;
    
        if(blob != null) {
          file = new File([blob], "profile.png", { type: blob.type, lastModified: new Date().getTime() });
        }
    
        this.coffeeService.save(`user/socialmedia/${type}`, {
          'name': user.name,
          'email': user.email,
          'photoUrl': user.photoUrl,
          'serverAuthCode': user.idToken,
          'photo': {
            file: file
          },
          'id': user.id
        }, true)
        .subscribe({
          next: (snapshot: any) => {
            if(snapshot?.token) {
                window.localStorage.setItem('sk', snapshot.token);
            }
          },
          error: () => {

           },
        });
      }*/

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

}
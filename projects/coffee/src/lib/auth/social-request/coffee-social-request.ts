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

    /**
     * It will redirect your page to the likendIn authorization page, 
     * 
     * after entering the credentials,
     * it will send it back to your "auth.likendIn.redirectUrl" page with a query parameter "code"
     * 
     * this "code" needs to be use to get the "acessToken".
     * to get "acesstoken" use the "validateLinkedInSignIn" method passing the code as parameter
     * 
     * @documentation
     * https://learn.microsoft.com/pt-br/linkedin/shared/authentication/authorization-code-flow
     */
    signInWithLinkedIn(): Observable<boolean> {
        if(!this.config?.auth || !this.config?.auth?.linkedIn) {
            throw Error('Must provide "auth" configuration property at "CoffeeModule.forRoot({})" before using linkedIn auth');
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
     * It uses the "code" from the "signInWithLinkedIn()" method to get the "acessToken"
     * 
     * from this point just use "coffeeService.auth.getCurrentUser()" to get the logged user 
     * information
     *
     * @param code linkeding code 
     * @param bodyData any extra body data to send on 'user/authenticate?linkedInCode=' usecase
     * @returns acessToken "bearer"
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

import { InjectionToken } from '@angular/core';

export const CONFIG = new InjectionToken<IConfig>('coffee config');

export interface ILinkedInAuthConfig {
     /**
     * ClientId can be found at https://www.linkedin.com/developers/apps/
     */
    clientId: string;
    /**
     * @default: r_emailaddress,r_liteprofile
     */
    scope?: string;
    /**
     * Url to redirect when authentication succeeds!
     */
    redirectUrl: string;
}

export interface IConfig {
    baseApiUrl: string;
    auth?: {
        linkedIn?: ILinkedInAuthConfig
    }
}

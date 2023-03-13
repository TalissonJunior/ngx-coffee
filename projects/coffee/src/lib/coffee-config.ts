
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

    /**
     * whether to open the linkedin in a popup
     */
    openInPopup?: boolean;
}

export interface IConfig {
    baseApiUrl: string;
    auth?: {
        linkedIn?: ILinkedInAuthConfig
    }
}

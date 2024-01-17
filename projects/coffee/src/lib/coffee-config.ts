import { InjectionToken } from '@angular/core';

/**
 * CONFIG is an InjectionToken used to inject a configuration object
 * adhering to the IConfig interface. It provides a mechanism to pass
 * configuration data to the parts of the application where Angular’s
 * dependency injection cannot reach, such as services.
 *
 * Example:
 * providers: [
 *   { provide: CONFIG, useValue: yourConfigObject }
 * ]
 */
export const CONFIG = new InjectionToken<IConfig>('coffee config');

/**
 * ILinkedInAuthConfig interface provides a structure for configuring
 * LinkedIn authentication settings within the application.
 *
 * Properties:
 * - clientId: A string that represents the client ID obtained from
 *   LinkedIn Developer portal.
 * - scope: (Optional) A string defining the permissions the application
 *   is requesting from the user. Default is 'r_emailaddress,r_liteprofile'.
 * - redirectUrl: A string representing the URL to which the user will
 *   be redirected after successful authentication.
 * - openInPopup: (Optional) A boolean indicating whether LinkedIn
 *   authentication should be performed in a popup window. Default is undefined.
 */
export interface ILinkedInAuthConfig {
    clientId: string;
    scope?: string;
    redirectUrl: string;
    openInPopup?: boolean;
}

/**
 * IGoogleAuthConfig interface provides a structure for configuring
 * Google authentication settings within the application.
 *
 * Properties:
 * - clientId: A string that represents the client ID obtained from
 *   Google Developer Console. The client ID should end with
 *   ".apps.googleusercontent.com".
 */
export interface IGoogleAuthConfig {
    clientId: string;
}

export interface IMicrosoftAuthConfig {
    /**
    * clientId: string
    *
    * The Client ID is a unique identifier for your application. It is used to authenticate
    * requests from your application to the Microsoft Identity Platform. You can retrieve
    * the Client ID from your app registration in the Azure portal.
    *
    * Visit the Azure portal (https://portal.azure.com/), navigate to "Azure Active Directory" >
    * "App registrations" > "Your app" to find the Client ID.
    *
    * Example:
    * clientId: 'YOUR_CLIENT_ID_FROM_AZURE_PORTAL'
    */
    clientId: string;

    /**
     * authority?: string (Optional)
     *
     * The Authority is a URL that indicates a directory that MSAL can request tokens from.
     * Commonly used authorities are:
     * - https://login.microsoftonline.com/common
     * - https://login.microsoftonline.com/organizations
     * - https://login.microsoftonline.com/{tenantId}
     *
     * If omitted, MSAL will use the default authority of
     * "https://login.microsoftonline.com/common".
     *
     * Example:
     * authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID'
     */
    authority?: string;

    /**
     * redirectUri: string
     *
     * The Redirect URI is the URL where the Microsoft Identity Platform will redirect the
     * user's browser after authentication has been completed successfully. This URI must
     * match one of the redirect URIs registered in the Azure portal.
     *
     * Ensure that the Redirect URI configured in the Azure portal and the one specified
     * in your app configuration are identical, including trailing slashes.
     *
     * Example:
     * redirectUri: 'http://localhost:4200/auth-callback'
     */
    redirectUri: string;
}

/**
 * IConfig Interface
 *
 * The `IConfig` interface provides a structured format for defining the configuration
 * settings utilized throughout the application. It allows developers to specify API
 * settings and authentication configurations for various OAuth providers, such as
 * LinkedIn, Google, and Microsoft.
 *
 * Properties:
 * - baseApiUrl: A string representing the base URL for API calls.
 * - auth: (Optional) An object containing authentication configurations for various
 *   OAuth providers, such as LinkedIn, Google, and Microsoft.
 *
 * Usage Example:
 * const appConfig: IConfig = {
 *   baseApiUrl: 'https://api.yourapp.com',
 *   auth: {
 *     linkedIn: {
 *       clientId: 'LINKEDIN_CLIENT_ID',
 *       redirectUrl: 'LINKEDIN_REDIRECT_URI',
 *       // other LinkedIn auth config properties...
 *     },
 *     google: {
 *       clientId: 'GOOGLE_CLIENT_ID',
 *       // other Google auth config properties...
 *     },
 *     microsoft: {
 *       clientId: 'MICROSOFT_CLIENT_ID',
 *       redirectUri: 'MICROSOFT_REDIRECT_URI',
 *       // other Microsoft auth config properties...
 *     }
 *   }
 * };
 */
export interface IConfig {
    /**
     * baseApiUrl: string
     *
     * Represents the base URL that will be used for all API calls throughout the
     * application. This URL is typically the root endpoint where your backend API
     * is hosted.
     *
     * Example:
     * baseApiUrl: 'https://api.yourapp.com'
     */
    baseApiUrl: string;

    /**
     * disableLogs: Boolean
     *
     * Determines whether the application sends error logs to the backend API.
     * When set to true, the application will not send error logs, which is useful in 
     * production environments to prevent logging non-critical errors or to reduce server load.
     * When set to false, the application will send error logs to the backend API, 
     * which is beneficial for monitoring and debugging during development.
     *
     * It's recommended to set this to false in production
     *
     * Example:
     * disableLogs: true  // Disables sending error logs to the API
     * disableLogs: false // Enables sending error logs to the API
     */
    disableLogs?: Boolean;

    /**
     * auth?: {
     *   linkedIn?: ILinkedInAuthConfig;
     *   google?: IGoogleAuthConfig;
     *   microsoft?: IMicrosoftAuthConfig;
     * } (Optional)
     *
     * Represents an optional object containing authentication configurations for
     * various OAuth providers. Each provider's configuration adheres to a specific
     * interface that defines the required settings for OAuth authentication with
     * that provider.
     *
     * - linkedIn?: ILinkedInAuthConfig (Optional): Configuration settings for LinkedIn OAuth.
     * - google?: IGoogleAuthConfig (Optional): Configuration settings for Google OAuth.
     * - microsoft?: IMicrosoftAuthConfig (Optional): Configuration settings for Microsoft OAuth.
     *
     * Example:
     * auth: {
     *   linkedIn: {
     *     clientId: 'YOUR_LINKEDIN_CLIENT_ID',
     *     redirectUrl: 'YOUR_LINKEDIN_REDIRECT_URI',
     *     // other LinkedIn auth config properties...
     *   },
     *   // similarly for google and microsoft...
     * }
     */
    auth?: {
        linkedIn?: ILinkedInAuthConfig;
        google?: IGoogleAuthConfig;
        /**
         * IMicrosoftAuthConfig Interface
         *
         * This interface provides a structured way to define configuration settings
         * for Microsoft authentication within an application. It allows developers
         * to specify various settings required for authenticating users via Microsoft
         * Identity Platform.
         *
         * Properties:
         * - clientId: A string representing the client ID obtained from the Azure portal.
         * - authority: (Optional) A string representing the authority URL to be used for
         *   authentication requests. Defaults to "https://login.microsoftonline.com/common".
         * - redirectUri: A string representing the URI to which the user will be redirected
         *   after successful authentication.
         *
         * Usage Example:
         * const microsoftAuthConfig: IMicrosoftAuthConfig = {
         *   clientId: 'YOUR_CLIENT_ID',
         *   redirectUri: 'YOUR_REDIRECT_URI',
         *   authority: 'YOUR_AUTHORITY_URL' // Optional
         * };
         */
        microsoft?: IMicrosoftAuthConfig;
    }
}
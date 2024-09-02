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
 */
export interface ILinkedInAuthConfig {

    /**
     * A string that represents the client ID obtained from LinkedIn Developer portal.
     */
    clientId: string;

    /**
     * A string defining the permissions the application is requesting from the user.
     * Default is 'r_emailaddress,r_liteprofile'.
     */
    scope?: string;

    /**
     * A string representing the URL to which the user will be redirected after successful authentication.
     */
    redirectUri: string;

    /**
     * A boolean indicating whether LinkedIn authentication should be performed in a popup window.
     * Default is `undefined`.
     */
    openInPopup?: boolean;
}

/**
 * IGoogleAuthConfig interface provides a structure for configuring
 * Google authentication settings within the application.
 */
export interface IGoogleAuthConfig {
    
    /**
     * A string that represents the client ID obtained from Google Developer Console.
     * The client ID should end with ".apps.googleusercontent.com".
     */
    clientId: string;

    /**
     * A string or array of strings representing the OAuth2 scopes requested during
     * the authentication process. Default scopes include 'email' and 'profile'.
     * Scopes should be split by comma, e.g., 'email,profile'.
     */
    scope?: string;

    /**
     * A boolean that indicates whether the Google authentication page should be
     * opened in a popup window or as a full-page redirect. Defaults to `true`.
     */
    openInPopup?: boolean;

    /**
     * A string representing the URL where Google should redirect the user after
     * authentication. This URL must match one of the authorized redirect URIs set in the Google Developer Console.
     */
    redirectUri: string;

    /**
     * A string that specifies the type of user consent screen to display.
     * Common values include 'consent' (to prompt for re-consent) and 'select_account'
     * (to prompt the user to select an account). Defaults to `undefined`.
     */
    prompt?: 'consent' | 'select_account';

    /**
     * A string that specifies whether your application needs to access Google services
     * on behalf of the user when they are not actively using your application.
     * Set to 'offline' to receive a refresh token. Defaults to `'offline'`.
     */
    accessType?: 'online' | 'offline';

    /**
     * A string that can be used to maintain state between the request and callback.
     * This is useful for preventing CSRF attacks. Defaults to `undefined`.
     */
    state?: string;
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

    /**
     * postLogoutRedirectUri: string
     *
     * The Post-Logout Redirect URI specifies where the Microsoft Identity Platform should
     * redirect the user's browser after the logout process has successfully completed. This URI
     * is essential for maintaining a smooth user experience by guiding the user to a specific
     * location after they have been logged out. For instance, you might want to redirect users
     * to the application's home page, a "You have been logged out" page, or the login page for
     * re-authentication.
     *
     * It's important that this URI is pre-registered in the Azure portal as part of your
     * application's configuration settings. The Microsoft Identity Platform validates the 
     * post-logout redirect URI against the registered URIs for security purposes. If the URI
     * used at runtime isn't registered, the redirection will not occur as expected.
     *
     * Configuration in the Azure Portal:
     * 1. Go to the Azure Portal (https://portal.azure.com/).
     * 2. Navigate to "Azure Active Directory" > "App registrations".
     * 3. Select your application.
     * 4. Under "Authentication", add your post-logout redirect URI in the "Logout URL"
     *    section.
     *
     * This URI can be absolute and point to any location that makes sense for your application's
     * user flow. For development purposes, you might use a localhost address, but ensure to
     * update this with the appropriate production URI before deploying your application.
     *
     * Usage Considerations:
     * - Use HTTPS in production: For security reasons, it's recommended to use HTTPS URLs for
     *   post-logout redirects in your production environment.
     * - Keep user experience in mind: Choose a redirect URI that makes sense for your users 
     *   and fits the flow of your application. For example, redirecting to a page that briefly 
     *   informs the user they have been logged out before automatically navigating to the home 
     *   page or login page can enhance clarity.
     *
     * Example:
     * postLogoutRedirectUri: 'http://localhost:4200/logout'
     */
    postLogoutRedirectUri?: string;

    /**
     * scopes?: Array<string> (Optional)
     *
     * An array of strings representing the Microsoft Graph permissions that your application
     * is requesting. These scopes determine the level of access to user data that your
     * application requires. Each scope translates to a specific permission on the Microsoft
     * Identity platform.
     *
     * Examples of common scopes include 'User.Read', 'Mail.Read', 'Files.ReadWrite'.
     * The scopes you choose will be presented to the user during the consent process.
     *
     * It is important to request only the scopes necessary for your application to
     * minimize the amount of access granted.
     *
     * Default is ['User.Read', 'User.ReadBasic.All'].
     *
     * Example:
     * scopes: ['User.Read', 'Calendars.Read']
     */
     scopes?: Array<string>;
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
     * disableEncryptErrorLogs: Boolean
     *
     * Controls the visibility of encryption error messages within the application. 
     * When set to true, the application suppresses the display of errors related 
     * to encryption processes, such as failures in obtaining the public key for 
     * authentication or encrypting sensitive data. This setting can be useful in 
     * production environments to enhance user experience by hiding technical encryption 
     * failures from the end users.
     *
     * When set to false, the application will display encryption error messages, 
     * assisting in the identification and debugging of issues related to encryption 
     * during development or in testing environments. It is beneficial for developers 
     * to have immediate feedback on encryption errors to promptly address and resolve them.
     *
     * It is recommended to set this to true in production environments to prevent 
     * potential exposure of sensitive encryption error details to end users and to 
     * ensure a cleaner user experience.
     *
     * Example:
     * disableEncryptErrorLogs: true  // Hides encryption error messages in the application
     * disableEncryptErrorLogs: false // Displays encryption error messages for debugging purposes
     */
    disableEncryptErrorLogs?: Boolean;

    /**
     * disableEncryption: Boolean
     *
     * Determines whether the application will perform encryption operations.
     * When set to true, all encryption processes will be bypassed, which can be useful
     * in development or testing environments where encryption is not needed or to
     * simplify debugging. When set to false, the application will perform encryption
     * operations as configured.
     *
     * It is recommended to set this to false in production environments to ensure
     * that sensitive data is always encrypted.
     *
     * Example:
     * disableEncryption: true  // Bypasses encryption operations
     * disableEncryption: false // Performs encryption operations as configured
     */
    disableEncryption?: Boolean;

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
     *     redirectUri: 'YOUR_LINKEDIN_REDIRECT_URI',
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
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IConfig, CONFIG } from './coffee-config';
import { CoffeeService } from './coffee.service';
import { CoffeeInterceptor } from './coffee.interceptor';
import { CoffeeGlobalErrorService } from './services/coffee-global-error.service';

import { BrowserCacheLocation, PublicClientApplication } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { Location } from '@angular/common';
import { CoffeeEncryptService } from './services/coffee-encrypt.service';

const microsoftFactoryConfig = (config: IConfig) => {
  return new PublicClientApplication({
    auth: {
      clientId: config.auth?.microsoft?.clientId ?? '',
      redirectUri: config.auth?.microsoft?.redirectUri ?? '',
      authority: config.auth?.microsoft?.authority ?? ''
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: true,
    }
  })
} 

@NgModule({
  /*declarations: [
    CoffeeSocialGoogleButtonComponent
  ],
  exports: [
    CoffeeSocialGoogleButtonComponent
  ],*/
  imports: [
    HttpClientModule, 
  ]
})
export class CoffeeModule { 
  static forRoot(config: IConfig): ModuleWithProviders<CoffeeModule>{
    return {
      ngModule: CoffeeModule,
      providers: [
        CoffeeService, 
        CoffeeEncryptService,
        { 
          provide: CONFIG, 
          useValue: config 
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CoffeeInterceptor,
          multi: true
        },
        {
          provide: ErrorHandler,
          useClass: CoffeeGlobalErrorService
        },
        // MICROSOFT SETUP
        {
          provide: MsalService,
          useFactory: (config: IConfig, location: Location) => 
          new MsalService(
            microsoftFactoryConfig(config),
            location
          ),
          deps: [CONFIG, Location]
        },
        {
          provide: PublicClientApplication,
          useFactory: microsoftFactoryConfig,
          deps: [CONFIG]
        }
      ]
    };
  }
}

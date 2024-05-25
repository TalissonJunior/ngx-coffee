import { APP_INITIALIZER, ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IConfig, CONFIG } from './coffee-config';
import { CoffeeService } from './coffee.service';
import { CoffeeInterceptor } from './coffee.interceptor';
import { CoffeeGlobalErrorService } from './services/coffee-global-error.service';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { Location } from '@angular/common';
import { CoffeeEncryptService } from './services/coffee-encrypt.service';
import { lastValueFrom } from 'rxjs';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';

const googleFactoryConfig = (config: IConfig) => {
  return {
    autoLogin: false,
    providers: [{
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(config.auth?.google?.clientId ?? '')
    }]
  };
}

const microsoftFactoryConfig = (config: IConfig) => {
  return new PublicClientApplication({
    auth: {
      clientId: config.auth?.microsoft?.clientId ?? '',
      redirectUri: config.auth?.microsoft?.redirectUri ?? '',
      authority: config.auth?.microsoft?.authority ?? ''
    }
  })
} 

export function initializeMsal(msalService: MsalService): () => Promise<void> {
  return (): Promise<void> => {
    return lastValueFrom(msalService.initialize());
  };
}

@NgModule({
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
          provide: APP_INITIALIZER,
          useFactory: initializeMsal,
          deps: [MsalService],
          multi: true
        },
        {
          provide: PublicClientApplication,
          useFactory: microsoftFactoryConfig,
          deps: [CONFIG]
        },
        // GOOGLE SETUP
        {
          provide: 'SocialAuthServiceConfig',
          useFactory: googleFactoryConfig,
          deps: [CONFIG]
        }
      ]
    };
  }
}

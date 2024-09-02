import {
  APP_INITIALIZER,
  ErrorHandler,
  ModuleWithProviders,
  NgModule,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IConfig, CONFIG } from './coffee-config';
import { CoffeeService } from './coffee.service';
import { CoffeeInterceptor } from './coffee.interceptor';
import { CoffeeGlobalErrorService } from './services/coffee-global-error.service';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { Location, isPlatformBrowser } from '@angular/common';
import { CoffeeEncryptService } from './services/coffee-encrypt.service';
import { lastValueFrom } from 'rxjs';
import { PlatformService } from './services/platform.service';

const microsoftFactoryConfig = (config: IConfig) => {
  return new PublicClientApplication({
    auth: {
      clientId: config.auth?.microsoft?.clientId ?? '',
      redirectUri: config.auth?.microsoft?.redirectUri ?? '',
      authority: config.auth?.microsoft?.authority ?? '',
    },
  });
};

export function initializeMsal(
  msalService: MsalService,
  platformId: Object
): () => Promise<void> {
  return (): Promise<void> => {
    if (isPlatformBrowser(platformId)) {
      // Only initialize MSAL on the browser
      return lastValueFrom(msalService.initialize());
    }
    return Promise.resolve(); // No-op for server
  };
}

@NgModule({
  imports: [HttpClientModule],
})
export class CoffeeModule {
  static forRoot(config: IConfig): ModuleWithProviders<CoffeeModule> {
    return {
      ngModule: CoffeeModule,
      providers: [
        CoffeeService,
        CoffeeEncryptService,
        {
          provide: CONFIG,
          useValue: config,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CoffeeInterceptor,
          multi: true,
        },
        {
          provide: ErrorHandler,
          useClass: CoffeeGlobalErrorService,
        },
        // MICROSOFT SETUP
        {
          provide: MsalService,
          useFactory: (config: IConfig, location: Location, platformId: Object) =>
            isPlatformBrowser(platformId) // Only instantiate MsalService on the browser
              ? new MsalService(microsoftFactoryConfig(config), location)
              : ({} as MsalService), // Provide a mock/no-op MsalService on the server
          deps: [CONFIG, Location, PLATFORM_ID],
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeMsal,
          deps: [MsalService, PLATFORM_ID],
          multi: true,
        },
        {
          provide: PublicClientApplication,
          useFactory: microsoftFactoryConfig,
          deps: [CONFIG],
        },
      ],
    };
  }
}

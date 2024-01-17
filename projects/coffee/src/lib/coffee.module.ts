import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IConfig, CONFIG } from './coffee-config';
import { CoffeeService } from './coffee.service';
import { CoffeeInterceptor } from './coffee.interceptor';
import { CoffeeSocialGoogleButtonComponent } from './buttons';
import { CoffeeGlobalErrorService } from './services/coffee-global-error.service';

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
        }
      ]
    };
  }
}

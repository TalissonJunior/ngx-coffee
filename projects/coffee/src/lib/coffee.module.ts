import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IConfig, CONFIG } from './coffee-config';
import { CoffeeService } from './coffee.service';
import { CoffeeInterceptor } from './coffee.interceptor';

@NgModule({
  declarations: [],
  imports: [HttpClientModule]
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
      ]
    };
  }
}

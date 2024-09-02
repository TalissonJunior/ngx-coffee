import { NgModule, ModuleWithProviders } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { CoffeeSsrComponent } from './coffee-ssr.component';

// Add a static method to configure the module
@NgModule({
  declarations: [CoffeeSsrComponent],
  imports: [ServerModule], // Import ServerModule for SSR
  exports: [CoffeeSsrComponent],
})
export class CoffeeSsrModule {
  // Static method to configure the module for server usage
  static forServer(): ModuleWithProviders<CoffeeSsrModule> {
    return {
      ngModule: CoffeeSsrModule,
      providers: [], // Provide any required services here
    };
  }
}
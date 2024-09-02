import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export class PlatformService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

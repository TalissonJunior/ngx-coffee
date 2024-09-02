import { isPlatformBrowser } from '@angular/common';
import { CONFIG, IConfig } from '../coffee-config';
import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Injectable, Inject, PLATFORM_ID } from '@angular/core';

@Injectable()
export class CoffeeGlobalErrorService implements ErrorHandler {
  private errorCache: Map<string, number> = new Map();
  private readonly errorCacheTime = 10000; // Time in milliseconds to cache the same error

  constructor(
    private http: HttpClient,
    @Inject(CONFIG) private config: IConfig,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  handleError(error: any): void {
    if (this.config.disableLogs || !this.config.baseApiUrl) {
      throw error;
    }

    const errorSignature = this.getErrorSignature(error);
    if (this.isErrorRecentlyLogged(errorSignature)) {
      throw error;
    }

    this.logError(error, errorSignature);
    throw error;
  }

  private logError(error: any, errorSignature: string): void {
    const message = error.message ? error.message : error.toString();
    const stack = error.stack ? error.stack : '';
    const currentUrl = isPlatformBrowser(this.platformId) ? window.location.href : '';
    const timestamp = new Date().toISOString();
    const logLevel = 'error';

    const errorPayload = {
      message: message,
      stack: stack,
      type: 'Angular',
      requestUrl: currentUrl,
      timestamp: timestamp,
      logLevel: logLevel 
    };

    this.errorCache.set(errorSignature, Date.now());
    this.http.post(this.config.baseApiUrl + '/coffee/log/error', errorPayload)
      .subscribe(() => {});
  }

  private getErrorSignature(error: any): string {
    return error.message;
  }

  private isErrorRecentlyLogged(errorSignature: string): boolean {
    const lastLoggedTime = this.errorCache.get(errorSignature);
    if (lastLoggedTime) {
      const timeElapsed = Date.now() - lastLoggedTime;
      if (timeElapsed < this.errorCacheTime) {
        return true;
      }
    }
    return false;
  }
}
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
  HttpSentEvent,
  HttpHandler,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpUserEvent
} from '@angular/common/http';

import { lastValueFrom, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthUtils } from './auth/auth-utils';
import { CONFIG, IConfig } from './coffee-config';
import { PlatformService } from './services/platform.service';

@Injectable()
export class CoffeeInterceptor implements HttpInterceptor {
  private config = inject<IConfig>(CONFIG);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
    | any
  > {
    
    if (!new PlatformService(PLATFORM_ID).isBrowser()) {
      return next.handle(request);
    }

    return next
      .handle(this.addTokenToRequest(request, AuthUtils.getToken() ?? '', this.config))
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(async (response: { error: { error: any; }; status: number; }) => {
          let error = response as any;

          if(response.error) {
            error = response.error;

            if(error.error) {
              error = error.error;
            }
          }

          if (response instanceof HttpErrorResponse) {
            // Forbidden user, insufficient privileges
            if (response.status === 403 || response.status !== 401) {
              return await lastValueFrom(throwError(() => error));
            }
          }

          return await lastValueFrom(throwError(() => error));
        })
      );
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string,
    config: IConfig
  ): HttpRequest<any> {
    // Check if the request already has an Authorization header and if the URL matches the baseApiUrl
    const alreadyHasAuthHeader = request.headers.has('Authorization');
    const isRequestToApi = request.url.indexOf(config.baseApiUrl) >= 0;

    if (!alreadyHasAuthHeader && token && isRequestToApi) {
      // Clone the request to add the new header
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Return the original request if no changes are needed
    return request;
  }
}

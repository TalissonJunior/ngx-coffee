import { inject, Injectable } from '@angular/core';
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
    return next
      .handle(this.addTokenToRequest(request, AuthUtils.getToken() ?? '', this.config))
      .pipe(
        map(response => {
          return response;
        }),
        catchError(async response => {
          const error = response.error.error ? response.error.error : response.error;

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
    // It will only add the token if the same exists and the request url matches the baseApiUrl
    if (
      !token || request.url.indexOf(config.baseApiUrl) < 0
    ) {
      return request;
    }

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { CoffeeRequest } from './request/coffee-request';
import { HttpClient } from "@angular/common/http";
import { CoffeeAuthRequest } from './auth/coffee-auth-request';
import { CoffeeFormUtil } from './forms/coffee-form-util';
import { CoffeeFileUtil } from './file/coffee-file-util';
import { MsalService } from '@azure/msal-angular';
import { CoffeeEncryptService } from './services/coffee-encrypt.service';

@Injectable()
export class CoffeeService extends CoffeeRequest {
  private authRequest: any;
  private formUtil: CoffeeFormUtil;
  
  constructor(
    httpClient: HttpClient,
    encrypt: CoffeeEncryptService,
    private msalService: MsalService
  ) {
    super(httpClient, encrypt);
  }

  /**
   * Service to handle authentication
   * @example auth<User>(User).isLoggedIn();
   */
  auth<T>(type?: new (val: any) => T): CoffeeAuthRequest<T> {
    if(!this.authRequest) {
      this.authRequest = new CoffeeAuthRequest<T>(
        this.config, 
        this.httpClient,
        this, 
        this.msalService,
        type
      );
    }

    return this.authRequest;
  }

  /**
   * Service to handle forms utils
   */
  forms(): CoffeeFormUtil {
    if(!this.formUtil) {
      this.formUtil = new CoffeeFormUtil();
    }

    return this.formUtil;
  }

  fileUtils(): CoffeeFileUtil {
    return new CoffeeFileUtil();
  }
}
import { CONFIG, IConfig } from '../coffee-config';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { CoffeeKeyPair } from '../models/coffee-key-pair';
import JSEncrypt from 'jsencrypt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoffeeEncryptService {
  private keyPair: CoffeeKeyPair;

  constructor(
    private http: HttpClient,
    @Inject(CONFIG) private config: IConfig
  ) {}

  async encrypt(data: string): Promise<string | false> {
    await this.fetchKey();
    
    if(!this.keyPair || !this.keyPair.id) {
      return data;
    }

    let encryptor = new JSEncrypt();
    encryptor.setPublicKey(this.keyPair.publicKey);
    return encryptor.encrypt(data);
  }
  
  private async fetchKey(): Promise<void> {
    if (this.keyPair && this.keyPair.id) {
      return;
    }
  
    try {
      const snapshot = await firstValueFrom(this.http.get<CoffeeKeyPair>(
        this.config.baseApiUrl + '/coffee/keys/_self')
      );
      this.keyPair = new CoffeeKeyPair(snapshot);
    } catch (error) {
      if (this.config.disableEncryptErrorLogs) {
        return;
      }

      console.error(
        "It appears that encryption has not been configured on the server. " +
        "To ensure your authentication data is securely transmitted, please verify the " +
        "encryption setup on the server side. If this issue persists, consult the server " +
        "configuration documentation. Alternatively, if you prefer not to see this message again, " +
        "you can disable encryption error logs by configuring the CoffeeModule with " +
        "`CoffeeModule.forRoot({ disableEncryptErrorLogs: true })` in your application setup."
      );
    }
  }
}
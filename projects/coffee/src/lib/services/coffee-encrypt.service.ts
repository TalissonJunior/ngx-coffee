import { CONFIG, IConfig } from '../coffee-config';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import JSEncrypt from 'jsencrypt';
import { firstValueFrom } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CoffeeEncryptService {
  private publicKey: string;

  constructor(
    private http: HttpClient,
    @Inject(CONFIG) private config: IConfig
  ) {}

  async encrypt<Z>(data: Z): Promise< Z | { k: string, d: string } | false> {
    await this.fetchKey();

    if (!this.publicKey) {
      return false;
    }

    const aesKey = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
    const aesIV = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Hex.parse(aesKey), {
      iv: CryptoJS.enc.Hex.parse(aesIV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();

    let encryptor = new JSEncrypt();
    encryptor.setPublicKey(this.publicKey);
    const encryptedKey = encryptor.encrypt(aesKey + ':' + aesIV);

    if (!encryptedKey || encryptedKey == "false") {
      return false;
    }

    return { k: encryptedKey, d: encryptedData };
  }
  
  private async fetchKey(): Promise<void> {
    if (this.publicKey) {
      return;
    }
  
    try {
      const options = { responseType: 'text' as 'text' } as any;
      const snapshot = await firstValueFrom(this.http.get<string>(
          this.config.baseApiUrl + '/coffee/keys/public', options
        )
      );
      this.publicKey = snapshot as any;
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
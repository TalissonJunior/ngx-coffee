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
  
  async encrypt<Z>(data: Z): Promise<Z | { k: string, d: string } | false> {
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

    const encryptedKey = await this.encryptWithPublicKey(aesKey + ':' + aesIV);

    if (!encryptedKey) {
      return false;
    }

    return { k: encryptedKey, d: encryptedData };
  }

  private async encryptWithPublicKey(data: string): Promise<string | null> {
    try {
      const enc = new TextEncoder();
  
      // Convert PEM to ArrayBuffer
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      let pemContents = this.publicKey.replace(pemHeader, '').replace(pemFooter, '');
      pemContents = pemContents.replace(/\s/g, '');
      const binaryDerString = atob(pemContents);
      const binaryDer = this.str2ab(binaryDerString);
  
      // Import the public key
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
          name: "RSA-OAEP",
          hash: { name: "SHA-256" }, // Specify the hash algorithm for OAEP
        },
        true,
        ["encrypt"]
      );
  
      // Encrypt the data
      const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
      } as RsaOaepParams, // Explicitly asserting the type
      cryptoKey,
      enc.encode(data)
    );

    // Convert Uint8Array to binary string
    const binaryString = Array.from(new Uint8Array(encryptedData), byte =>
      String.fromCharCode(byte)
    ).join('');

    return btoa(binaryString);
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }
  
  private str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
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
      if (this.config.disableEncryptErrorLogs || this.config.disableEncryption) {
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
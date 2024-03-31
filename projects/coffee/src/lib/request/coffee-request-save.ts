import { HttpClient } from '@angular/common/http';
import { CoffeeEncryptService } from '../services/coffee-encrypt.service';
import { CoffeeRequestPostPut } from './coffee-request-post-put';

export class CoffeeRquestSave<T>  extends CoffeeRequestPostPut<T>{

    constructor(
        httpClient: HttpClient,
        encryptService: CoffeeEncryptService,
        url: string,
        vo: T,
        isFormData: boolean = false
    ) {
        super(httpClient, encryptService, url, vo, false, isFormData);
    }

    /**
    * Configures the request to use HTTP PUT method when the data object has an 'id' property greater than 0.
    * By default, or if the data object does not have an 'id' or its value is not greater than 0, HTTP POST is used.
    * 
    * @returns The SaveRequest instance for method chaining.
    */
    useHttpPutWhenId(): CoffeeRquestSave<T> {

        if((this.vo as any).id && (this.vo as any).id > 0) {
            this.usePut = true;
        }

        return this;
    }
}
import { CoffeeModel } from ".";

export class CoffeeKeyPair extends CoffeeModel {
    id: number = 0;
    identifier: string = '';
    publicKey: string = ''
    createdAt: string = '';
    updatedAt: string = '';

    constructor(model: any) {
        super();
        this.map(model);
    }
}
export class CoffeeFileUpload {
    id: number = 0;
    createdAt: string = '';
    updatedAt: string = '';
    name: string = '';
    size: number = 0;
    extension: string = '';
    path: string = '';

    constructor(init?: Partial<CoffeeFileUpload>) {
      Object.assign(this, init);
    }
  }
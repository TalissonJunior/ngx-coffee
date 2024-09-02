import { TestBed } from '@angular/core/testing';

import { CoffeeSsrService } from './coffee-ssr.service';

describe('CoffeeSsrService', () => {
  let service: CoffeeSsrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoffeeSsrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

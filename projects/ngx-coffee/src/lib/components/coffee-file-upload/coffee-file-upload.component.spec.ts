import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeFileUploadComponent } from './coffee-file-upload.component';

describe('FileUploadComponent', () => {
  let component: CoffeeFileUploadComponent;
  let fixture: ComponentFixture<CoffeeFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoffeeFileUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

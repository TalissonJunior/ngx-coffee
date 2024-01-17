import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeSocialGoogleButtonComponent } from './coffee-social-google-button.component';

describe('CoffeeSocialGoogleButtonComponent', () => {
  let component: CoffeeSocialGoogleButtonComponent;
  let fixture: ComponentFixture<CoffeeSocialGoogleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoffeeSocialGoogleButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeSocialGoogleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

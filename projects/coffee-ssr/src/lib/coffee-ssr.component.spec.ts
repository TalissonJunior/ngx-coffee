import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeSsrComponent } from './coffee-ssr.component';

describe('CoffeeSsrComponent', () => {
  let component: CoffeeSsrComponent;
  let fixture: ComponentFixture<CoffeeSsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoffeeSsrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeSsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

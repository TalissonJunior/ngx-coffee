import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeSvgIconComponent } from './coffee-svg-icon.component';

describe('CoffeeSvgIconComponent', () => {
  let component: CoffeeSvgIconComponent;
  let fixture: ComponentFixture<CoffeeSvgIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoffeeSvgIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeSvgIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

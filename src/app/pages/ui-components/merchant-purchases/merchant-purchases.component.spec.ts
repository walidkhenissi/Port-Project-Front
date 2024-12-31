import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantPurchasesComponent } from './merchant-purchases.component';

describe('MerchantPurchasesComponent', () => {
  let component: MerchantPurchasesComponent;
  let fixture: ComponentFixture<MerchantPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantPurchasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

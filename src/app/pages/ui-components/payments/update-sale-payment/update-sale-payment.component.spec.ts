import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSalePaymentComponent } from './update-sale-payment.component';

describe('UpdateSalePaymentComponent', () => {
  let component: UpdateSalePaymentComponent;
  let fixture: ComponentFixture<UpdateSalePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSalePaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSalePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

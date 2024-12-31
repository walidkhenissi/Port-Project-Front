import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSalesTransactionPaymentComponent } from './update-sales-transaction-payment.component';

describe('UpdateSalesTransactionPaymentComponent', () => {
  let component: UpdateSalesTransactionPaymentComponent;
  let fixture: ComponentFixture<UpdateSalesTransactionPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSalesTransactionPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSalesTransactionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerPaymentComponent } from './producer-payment.component';

describe('ProducerPaymentComponent', () => {
  let component: ProducerPaymentComponent;
  let fixture: ComponentFixture<ProducerPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProducerPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducerPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

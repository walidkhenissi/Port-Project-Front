import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashTransactionComponent } from './cash-transaction.component';

describe('CashTransactionComponent', () => {
  let component: CashTransactionComponent;
  let fixture: ComponentFixture<CashTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

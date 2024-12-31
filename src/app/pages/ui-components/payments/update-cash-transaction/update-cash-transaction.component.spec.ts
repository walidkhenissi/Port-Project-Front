import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCashTransactionComponent } from './update-cash-transaction.component';

describe('UpdateCashTransactionComponent', () => {
  let component: UpdateCashTransactionComponent;
  let fixture: ComponentFixture<UpdateCashTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCashTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCashTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

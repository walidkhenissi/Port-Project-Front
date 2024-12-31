import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSalesTransactionComponent } from './update-sales-transaction.component';

describe('UpdateSalesTransactionComponent', () => {
  let component: UpdateSalesTransactionComponent;
  let fixture: ComponentFixture<UpdateSalesTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSalesTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSalesTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

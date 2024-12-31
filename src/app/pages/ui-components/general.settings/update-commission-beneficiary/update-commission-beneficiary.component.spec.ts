import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCommissionBeneficiaryComponent } from './update-commission-beneficiary.component';

describe('UpdateCommissionBeneficiaryComponent', () => {
  let component: UpdateCommissionBeneficiaryComponent;
  let fixture: ComponentFixture<UpdateCommissionBeneficiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCommissionBeneficiaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCommissionBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

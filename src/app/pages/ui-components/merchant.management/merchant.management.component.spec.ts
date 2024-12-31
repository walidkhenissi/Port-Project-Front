import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantManagementComponent } from './merchant.management.component';

describe('MerchantManagementComponent', () => {
  let component: MerchantManagementComponent;
  let fixture: ComponentFixture<MerchantManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

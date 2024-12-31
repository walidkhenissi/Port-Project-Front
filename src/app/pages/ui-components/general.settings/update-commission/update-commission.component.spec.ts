import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCommissionComponent } from './update-commission.component';

describe('UpdateCommissionComponent', () => {
  let component: UpdateCommissionComponent;
  let fixture: ComponentFixture<UpdateCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCommissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

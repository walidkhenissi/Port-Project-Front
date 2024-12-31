import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionHistoryComponent } from './commission-history.component';

describe('CommissionHistoryComponent', () => {
  let component: CommissionHistoryComponent;
  let fixture: ComponentFixture<CommissionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

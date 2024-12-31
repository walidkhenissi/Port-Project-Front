import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxesMovementComponent } from './boxes-movement.component';

describe('BoxesMovementComponent', () => {
  let component: BoxesMovementComponent;
  let fixture: ComponentFixture<BoxesMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxesMovementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxesMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

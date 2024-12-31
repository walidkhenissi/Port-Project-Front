import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBoxesMovementComponent } from './update-boxes-movement.component';

describe('UpdateBoxesMovementComponent', () => {
  let component: UpdateBoxesMovementComponent;
  let fixture: ComponentFixture<UpdateBoxesMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateBoxesMovementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBoxesMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

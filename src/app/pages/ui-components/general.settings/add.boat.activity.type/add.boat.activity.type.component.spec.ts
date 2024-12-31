import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBoatActivityTypeComponent } from './add.boat.activity.type.component';

describe('AddBoatActivityTypeComponent', () => {
  let component: AddBoatActivityTypeComponent;
  let fixture: ComponentFixture<AddBoatActivityTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBoatActivityTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBoatActivityTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

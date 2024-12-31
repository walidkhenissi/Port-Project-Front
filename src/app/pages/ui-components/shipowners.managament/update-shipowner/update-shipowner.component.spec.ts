import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateShipownerComponent } from './update-shipowner.component';

describe('UpdateShipownerComponent', () => {
  let component: UpdateShipownerComponent;
  let fixture: ComponentFixture<UpdateShipownerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateShipownerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateShipownerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

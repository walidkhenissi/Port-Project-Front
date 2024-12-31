import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipownersManagamentComponent } from './shipowners.managament.component';

describe('ShipownersManagamentComponent', () => {
  let component: ShipownersManagamentComponent;
  let fixture: ComponentFixture<ShipownersManagamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipownersManagamentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipownersManagamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

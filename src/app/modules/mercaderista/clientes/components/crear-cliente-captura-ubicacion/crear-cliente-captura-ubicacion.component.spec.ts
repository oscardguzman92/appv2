import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearClienteCapturaUbicacionComponent } from './crear-cliente-captura-ubicacion.component';

describe('CrearClienteCapturaUbicacionComponent', () => {
  let component: CrearClienteCapturaUbicacionComponent;
  let fixture: ComponentFixture<CrearClienteCapturaUbicacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearClienteCapturaUbicacionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearClienteCapturaUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

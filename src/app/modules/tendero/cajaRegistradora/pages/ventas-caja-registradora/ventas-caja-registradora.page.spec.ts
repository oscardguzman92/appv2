import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasCajaRegistradoraPage } from './ventas-caja-registradora.page';

describe('VentasCajaRegistradoraPage', () => {
  let component: VentasCajaRegistradoraPage;
  let fixture: ComponentFixture<VentasCajaRegistradoraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentasCajaRegistradoraPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasCajaRegistradoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

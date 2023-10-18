import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarDatosCajaRegistradoraPage } from '../caja-registradora/confirmar-datos-caja-registradora.page';

describe('ConfirmarDatosCajaRegistradoraPage', () => {
  let component: ConfirmarDatosCajaRegistradoraPage;
  let fixture: ComponentFixture<ConfirmarDatosCajaRegistradoraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarDatosCajaRegistradoraPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarDatosCajaRegistradoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

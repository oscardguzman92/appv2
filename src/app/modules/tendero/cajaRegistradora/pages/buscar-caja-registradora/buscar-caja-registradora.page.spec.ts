import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCajaRegistradoraPage } from './buscar-caja-registradora.page';

describe('BuscarCajaRegistradoraPage', () => {
  let component: BuscarCajaRegistradoraPage;
  let fixture: ComponentFixture<BuscarCajaRegistradoraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarCajaRegistradoraPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarCajaRegistradoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodoDePagoCajaRegistradoraPage } from './metodo-de-pago-caja-registradora.page';

describe('MetodoDePagoCajaRegistradoraPage', () => {
  let component: MetodoDePagoCajaRegistradoraPage;
  let fixture: ComponentFixture<MetodoDePagoCajaRegistradoraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetodoDePagoCajaRegistradoraPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetodoDePagoCajaRegistradoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

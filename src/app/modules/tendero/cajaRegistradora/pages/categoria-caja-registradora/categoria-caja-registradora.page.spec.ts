import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaCajaRegistradoraPage } from './categoria-caja-registradora.page';

describe('CategoriaCajaRegistradoraPage', () => {
  let component: CategoriaCajaRegistradoraPage;
  let fixture: ComponentFixture<CategoriaCajaRegistradoraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoriaCajaRegistradoraPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriaCajaRegistradoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

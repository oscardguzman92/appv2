import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioSuperVendedorPage } from './inicio-super-vendedor.page';

describe('InicioSuperVendedorPage', () => {
  let component: InicioSuperVendedorPage;
  let fixture: ComponentFixture<InicioSuperVendedorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioSuperVendedorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioSuperVendedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

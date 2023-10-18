import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcasClientesPage } from './marcas-clientes.page';

describe('MarcasClientesPage', () => {
  let component: MarcasClientesPage;
  let fixture: ComponentFixture<MarcasClientesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarcasClientesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcasClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

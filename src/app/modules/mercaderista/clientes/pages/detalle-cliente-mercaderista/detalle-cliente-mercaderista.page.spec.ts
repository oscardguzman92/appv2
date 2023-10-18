import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleClienteMercaderistaPage } from './detalle-cliente-mercaderista.page';

describe('DetalleClienteMercaderistaPage', () => {
  let component: DetalleClienteMercaderistaPage;
  let fixture: ComponentFixture<DetalleClienteMercaderistaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleClienteMercaderistaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleClienteMercaderistaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

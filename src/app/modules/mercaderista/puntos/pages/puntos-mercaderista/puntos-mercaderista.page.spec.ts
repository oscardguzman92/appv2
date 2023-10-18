import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntosMercaderistaPage } from './puntos-mercaderista.page';

describe('PuntosMercaderistaPage', () => {
  let component: PuntosMercaderistaPage;
  let fixture: ComponentFixture<PuntosMercaderistaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PuntosMercaderistaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PuntosMercaderistaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

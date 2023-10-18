import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialNovedadesPage } from './historial-novedades.page';

describe('HistorialNovedadesPage', () => {
  let component: HistorialNovedadesPage;
  let fixture: ComponentFixture<HistorialNovedadesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialNovedadesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialNovedadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

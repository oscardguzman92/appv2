import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesPage } from './devoluciones.page';

describe('DevolucionesPage', () => {
  let component: DevolucionesPage;
  let fixture: ComponentFixture<DevolucionesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

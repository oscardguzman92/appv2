import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevioBusquedaPage } from './previo-busqueda.page';

describe('PrevioBusquedaPage', () => {
  let component: PrevioBusquedaPage;
  let fixture: ComponentFixture<PrevioBusquedaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevioBusquedaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevioBusquedaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

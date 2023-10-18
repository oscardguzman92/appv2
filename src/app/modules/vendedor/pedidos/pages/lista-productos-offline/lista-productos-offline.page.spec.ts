import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProductosOfflinePage } from './lista-productos-offline.page';

describe('ListaProductosOfflinePage', () => {
  let component: ListaProductosOfflinePage;
  let fixture: ComponentFixture<ListaProductosOfflinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaProductosOfflinePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaProductosOfflinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

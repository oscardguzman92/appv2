import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecorridoTransportadorPage } from './recorrido-transportador.page';

describe('RecorridoTransportadorPage', () => {
  let component: RecorridoTransportadorPage;
  let fixture: ComponentFixture<RecorridoTransportadorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecorridoTransportadorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecorridoTransportadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

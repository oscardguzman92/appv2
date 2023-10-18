import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaTransportadorComponent } from './mapa-transportador.component';

describe('MapaTransportadorComponent', () => {
  let component: MapaTransportadorComponent;
  let fixture: ComponentFixture<MapaTransportadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapaTransportadorComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaTransportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

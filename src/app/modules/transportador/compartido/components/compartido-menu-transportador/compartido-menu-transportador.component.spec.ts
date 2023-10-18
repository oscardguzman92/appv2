import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartidoMenuTransportadorComponent } from './compartido-menu-transportador.component';

describe('CompartidoMenuTransportadorComponent', () => {
  let component: CompartidoMenuTransportadorComponent;
  let fixture: ComponentFixture<CompartidoMenuTransportadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartidoMenuTransportadorComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartidoMenuTransportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

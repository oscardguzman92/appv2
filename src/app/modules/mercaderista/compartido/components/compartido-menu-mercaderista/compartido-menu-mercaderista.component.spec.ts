import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartidoMenuMercaderistaComponent } from './compartido-menu-mercaderista.component';

describe('CompartidoMenuMercaderistaComponent', () => {
  let component: CompartidoMenuMercaderistaComponent;
  let fixture: ComponentFixture<CompartidoMenuMercaderistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartidoMenuMercaderistaComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartidoMenuMercaderistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

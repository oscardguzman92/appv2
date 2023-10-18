import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiCodigoPage } from './mi-codigo.page';

describe('MiCodigoPage', () => {
  let component: MiCodigoPage;
  let fixture: ComponentFixture<MiCodigoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiCodigoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiCodigoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

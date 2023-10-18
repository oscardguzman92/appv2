import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidadorPage } from './liquidador.page';

describe('LiquidadorPage', () => {
  let component: LiquidadorPage;
  let fixture: ComponentFixture<LiquidadorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidadorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

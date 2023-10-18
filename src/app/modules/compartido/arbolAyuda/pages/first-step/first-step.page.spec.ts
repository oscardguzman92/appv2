import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstStepPage } from './first-step.page';

describe('FirstStepPage', () => {
  let component: FirstStepPage;
  let fixture: ComponentFixture<FirstStepPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstStepPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstStepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

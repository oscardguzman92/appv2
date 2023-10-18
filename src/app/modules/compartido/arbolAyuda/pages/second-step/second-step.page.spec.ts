import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondStepPage } from './second-step.page';

describe('SecondStepPage', () => {
  let component: SecondStepPage;
  let fixture: ComponentFixture<SecondStepPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondStepPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondStepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

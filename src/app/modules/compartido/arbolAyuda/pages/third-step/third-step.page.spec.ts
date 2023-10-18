import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdStepPage } from './third-step.page';

describe('ThirdStepPage', () => {
  let component: ThirdStepPage;
  let fixture: ComponentFixture<ThirdStepPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThirdStepPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdStepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

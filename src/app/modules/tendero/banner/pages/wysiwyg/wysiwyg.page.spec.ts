import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WysiwygPage } from './wysiwyg.page';

describe('WysiwygPage', () => {
  let component: WysiwygPage;
  let fixture: ComponentFixture<WysiwygPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WysiwygPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WysiwygPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

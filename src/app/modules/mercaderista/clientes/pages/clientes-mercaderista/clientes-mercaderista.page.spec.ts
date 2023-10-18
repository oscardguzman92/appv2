import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesMercaderistaPage } from './clientes-mercaderista.page';

describe('ClientesMercaderistaPage', () => {
  let component: ClientesMercaderistaPage;
  let fixture: ComponentFixture<ClientesMercaderistaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientesMercaderistaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesMercaderistaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartidoMenuSuperVendedorComponent } from './compartido-menu-super-vendedor.component';

describe('CompartidoMenuSuperVendedorComponent', () => {
  let component: CompartidoMenuSuperVendedorComponent;
  let fixture: ComponentFixture<CompartidoMenuSuperVendedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartidoMenuSuperVendedorComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartidoMenuSuperVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

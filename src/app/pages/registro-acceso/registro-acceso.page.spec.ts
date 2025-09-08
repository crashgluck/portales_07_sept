import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroAccesoPage } from './registro-acceso.page';

describe('RegistroAccesoPage', () => {
  let component: RegistroAccesoPage;
  let fixture: ComponentFixture<RegistroAccesoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAccesoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

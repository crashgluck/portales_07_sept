import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroListPage } from './registro-list.page';

describe('RegistroListPage', () => {
  let component: RegistroListPage;
  let fixture: ComponentFixture<RegistroListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

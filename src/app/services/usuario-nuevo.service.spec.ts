import { TestBed } from '@angular/core/testing';

import { UsuarioNuevoService } from './usuario-nuevo.service';

describe('UsuarioNuevoService', () => {
  let service: UsuarioNuevoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioNuevoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

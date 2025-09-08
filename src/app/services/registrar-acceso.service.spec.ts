import { TestBed } from '@angular/core/testing';

import { RegistrarAccesoService } from './registrar-acceso.service';

describe('RegistrarAccesoService', () => {
  let service: RegistrarAccesoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrarAccesoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

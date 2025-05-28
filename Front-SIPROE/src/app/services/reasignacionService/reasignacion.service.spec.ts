import { TestBed } from '@angular/core/testing';

import { ReasignacionService } from './reasignacion.service';

describe('ReasignacionService', () => {
  let service: ReasignacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReasignacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

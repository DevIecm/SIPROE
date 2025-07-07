import { TestBed } from '@angular/core/testing';

import { MonitorServiceService } from './monitor-service.service';

describe('MonitorServiceService', () => {
  let service: MonitorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

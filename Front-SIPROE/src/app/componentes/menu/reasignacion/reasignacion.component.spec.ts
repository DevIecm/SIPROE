import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasignacionComponent } from './reasignacion.component';

describe('ReasignacionComponent', () => {
  let component: ReasignacionComponent;
  let fixture: ComponentFixture<ReasignacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasignacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReasignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

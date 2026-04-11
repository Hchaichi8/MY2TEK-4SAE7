import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Useradmin } from './useradmin';

describe('Useradmin', () => {
  let component: Useradmin;
  let fixture: ComponentFixture<Useradmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Useradmin],
    }).compileComponents();

    fixture = TestBed.createComponent(Useradmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

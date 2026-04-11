import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProductPage } from './detail-product-page';

describe('DetailProductPage', () => {
  let component: DetailProductPage;
  let fixture: ComponentFixture<DetailProductPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailProductPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailProductPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

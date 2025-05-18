import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnitureCardComponent } from './furniture-card.component';

describe('FurnitureCardComponent', () => {
  let component: FurnitureCardComponent;
  let fixture: ComponentFixture<FurnitureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FurnitureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FurnitureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

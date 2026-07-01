import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCanvasComponent } from './detail-canvas';

describe('DetailCanvas', () => {
  let component: DetailCanvasComponent;
  let fixture: ComponentFixture<DetailCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCanvasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailCanvasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

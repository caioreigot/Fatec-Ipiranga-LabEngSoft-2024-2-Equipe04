import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectButtonComponent } from './rect-button.component';

describe('RectButtonComponent', () => {
  let component: RectButtonComponent;
  let fixture: ComponentFixture<RectButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RectButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

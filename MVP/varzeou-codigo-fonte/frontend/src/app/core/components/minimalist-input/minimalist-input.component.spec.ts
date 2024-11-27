import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimalistInputComponent } from './minimalist-input.component';

describe('MinimalistInputComponent', () => {
  let component: MinimalistInputComponent;
  let fixture: ComponentFixture<MinimalistInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinimalistInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimalistInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

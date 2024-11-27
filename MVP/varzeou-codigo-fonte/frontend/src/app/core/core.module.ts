import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimalistInputComponent } from './components/minimalist-input/minimalist-input.component';
import { RectButtonComponent } from './components/rect-button/rect-button.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { FormatDatePipe } from './pipes/format-date.pipe';

@NgModule({
  declarations: [
    MinimalistInputComponent,
    RectButtonComponent,
    TimeAgoPipe,
    FormatDatePipe,
  ],
  exports: [
    MinimalistInputComponent,
    RectButtonComponent,
    TimeAgoPipe,
    FormatDatePipe
  ],
  imports: [
    CommonModule
  ]
})
export class CoreModule {}
import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-minimalist-input',
  templateUrl: './minimalist-input.component.html',
  styleUrls: ['./minimalist-input.component.less']
})
export class MinimalistInputComponent {
  
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() width: string = "100%";
  @Input() padding: string = "12px";
  @Input() fontSize: string = "1rem";

  constructor(private ref: ElementRef) {
    const element: HTMLElement = this.ref.nativeElement;
    element.style.width = this.width;
  }
}

import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-rect-button',
  templateUrl: './rect-button.component.html',
  styleUrls: ['./rect-button.component.less']
})
export class RectButtonComponent {

  @Input() width: string = "100%";
  @Input() class: string = "";
  @Input() fontSize: string = "1.2rem";
  
  constructor(private ref: ElementRef) {
    const element: HTMLElement = this.ref.nativeElement;
    element.style.width = this.width;
  }
}
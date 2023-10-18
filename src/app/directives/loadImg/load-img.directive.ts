import { Directive, ElementRef, Renderer, Input } from '@angular/core';

@Directive({
  selector: '[loadImg]'
})
export class LoadImgDirective {
  loadEvent: Function;
  @Input('loadImg') img: string;
  constructor(public element: ElementRef, public renderer: Renderer) { 
  }

  ngOnInit() {
    // get img element
    const nativeElement = this.element.nativeElement;
    const render = this.renderer;

    // add load listener
    this.loadEvent = render.listen(nativeElement, 'load', () => {
      render.setElementAttribute(nativeElement, 'src', this.img);
    });
  }

  /* @HostListener('ionImgDidLoad', ['$event'])
  ionImgDidLoad(){
    const nativeElement = this.element.nativeElement;
    const render = this.renderer;
    render.setElementAttribute(nativeElement, 'src', this.img);
    console.log("Siiii")
  } */

  

}

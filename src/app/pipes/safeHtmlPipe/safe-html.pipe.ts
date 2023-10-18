import {Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
 
  constructor(private sanitizer: DomSanitizer) {
  }
 
  transform(value: any, args?: any): any {
    let r = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    console.log(args);
    console.log(r,value);
    return r;
  }
 
}

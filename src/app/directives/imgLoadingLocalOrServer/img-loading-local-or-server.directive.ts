import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {DomController} from '@ionic/angular';
import {Observable, of, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Config} from '../../enums/config.enum';

@Directive({
    selector: '[appImgLoadingLocalOrServer]'
})
export class ImgLoadingLocalOrServerDirective implements OnInit, OnDestroy {
    @Input('routeServer') serverPath: string | Config;
    @Input('image') imagePath: string;
    @Input('appImgLoadingLocalOrServer') localUrl: string;
    @Input('localPathComplete') localPathComplete: boolean;

    private existSubs = new Subscription();

    constructor(
        private element: ElementRef,
        private renderer: Renderer2,
        private domCtrl: DomController,
        private httpClient: HttpClient) {
    }

    ngOnInit(): void {
        const src = (this.localPathComplete) ? this.localUrl : this.localUrl + this.imagePath;
        this.existSubs = this.exists(src, this.serverPath + this.imagePath)
            .subscribe((res) => {
                this.renderer.setAttribute(this.element.nativeElement, 'src', res);
            });
    }


    exists(imagePath, serverPath): Observable<string> {
        return this.httpClient
            .get(`${imagePath}`, { observe: 'response', responseType: 'blob' })
            .pipe(
                map(response => {
                    return imagePath;
                }),
                catchError(error => {
                    return of(serverPath);
                })
            );
    }

    ngOnDestroy(): void {
        this.existSubs.unsubscribe();
    }


}

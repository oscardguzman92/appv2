import { Component, OnInit, ElementRef, OnDestroy, ViewChild, Renderer2, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-wysiwyg',
  templateUrl: './wysiwyg.page.html',
  styleUrls: ['./wysiwyg.page.scss'],
})

export class WysiwygPage implements OnInit {

  public wysiwyg: string;
  public title: string;
  public role: string;
  public boton_id: number;
  public interna_id: string;
  @ViewChild('a') content: ElementRef
  @HostListener('document:click', ['$event'])
    andClickEvent(event) {
      this.analyticsService.sendEvent('boton_interna', {
        'notification_id': this.interna_id,
        'firebase_screen': this.boton_id,
        'campaign': event.target.text + '-' + event.target.href,
        'source': this.role
      });
    }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public sanitizer: DomSanitizer,
    private analyticsService: AnalyticsService) {

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
            this.interna_id = this.router.getCurrentNavigation().extras.state.data.interna_id;
            this.boton_id = this.router.getCurrentNavigation().extras.state.data.id;
            this.role = this.router.getCurrentNavigation().extras.state.data.role;
            this.wysiwyg = this.router.getCurrentNavigation().extras.state.data.wysiwyg;
            this.title = this.router.getCurrentNavigation().extras.state.data.title;
            this.title = this.title + ' ' + this.router.getCurrentNavigation().extras.state.data.subtitle;
        }
      });
  }

  ngOnInit() {

  }



}

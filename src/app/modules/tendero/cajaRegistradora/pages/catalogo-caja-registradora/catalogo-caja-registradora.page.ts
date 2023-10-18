import { Component, OnInit } from '@angular/core';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-catalogo-caja-registradora',
  templateUrl: './catalogo-caja-registradora.page.html',
  styleUrls: ['./catalogo-caja-registradora.page.scss'],
})
export class CatalogoCajaRegistradoraPage implements OnInit {

  public products: any;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackButton: boolean;
  public heightViewport: number;
  public widthViewport: number;
  public slidesMax: number;
  public slidesMin: number;

  public slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 2,
    slidesPerColumn: 5,
    spaceBetween: 8,
    slidesPerColumnFill: 'row',
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
      renderCustom: (swiper, current, total) => {
        return this.customProgressBar(current, total);
      }
    }
  };

  constructor(
    private storage: Storage,
    private navigation: NavigationHelper,
    public barcodescanner: BarcodeScanner,
    private platform: Platform
  ) {
    this.configurePlatform();
  }

  ngOnInit() {
    this.configureInit();
    this.configureSlides();
  }

  configurePlatform() {
    this.platform.ready().then((readySource) => {
      this.heightViewport = this.platform.height();
      this.widthViewport = this.platform.width();
    });
  }
  configureSlides() {
    if (this.heightViewport <= 568) {
      this.slidesMax = 4;
      this.slidesMin = 3;
    } else if (this.heightViewport > 568) {
      this.slidesMax = 5;
      this.slidesMin = 4;
    }
  }

  configureInit() {
    this.title = 'Catálogo de productos';
    this.subtitle = 'Selecciona tus productos más vendidos';
    this.showTitle = true;
    this.showBackButton = true;
    this.storage.get('CashRegisterProducts').then(response => {
      this.products = response;
    });
  }
  close() {
    this.goToCashRegister();
  }

  goToCashRegister(params: any = null) {
    this.navigation.goTo('caja-registradora');
  }

  goToNewProduct(params: any = null) {
    this.navigation.goTo('nuevo-producto', { 'ean': params });
  }

  private customProgressBar(current: number, total: number): string {
    const ratio: number = current / total;
    // tslint:disable-next-line: max-line-length
    const progressBarStyle: string = 'style=\'transform: translate3d(0px, 0px, 0px) scaleX(' + ratio + ') scaleY(1); transition-duration: 300ms;\'';
    const progressBar: string = '<span class=\'swiper-pagination-progressbar-fill\' ' + progressBarStyle + '></span>';

    let progressBarContainer = '<div class=\'swiper-pagination-progressbar\' style=\'height: 6px; top: 6px; width: 100%;\'>';
    progressBarContainer += progressBar;
    progressBarContainer += '</span></div>';

    return progressBarContainer;
  }

  scan() {
    this.barcodescanner.scan().then(barcodeData => {
      this.goToNewProduct(barcodeData['text']);
    }).catch(err => {
    });
  }

}

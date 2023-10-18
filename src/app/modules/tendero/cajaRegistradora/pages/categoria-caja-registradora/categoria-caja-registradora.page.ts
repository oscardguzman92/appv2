import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { UtilitiesHelper } from 'src/app/helpers/utilities/utilities.helper';
import { ActivatedRoute } from '@angular/router';
import { IonSlides, Platform } from '@ionic/angular';
import { IUser } from '../../../../../interfaces/IUser';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';

@Component({
  selector: 'app-categoria-caja-registradora',
  templateUrl: './categoria-caja-registradora.page.html',
  styleUrls: ['./categoria-caja-registradora.page.scss'],
})
export class CategoriaCajaRegistradoraPage implements OnInit {

  public message: string;
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public updatingSlides: boolean;
  public showBackButton: boolean;
  public categories: any;
  public threadFilters: any = [];
  public firstBranch: boolean;
  public showNewProduct: boolean;
  public heightViewport: number;
  public widthViewport: number;
  public slidesMax: number;
  public slidesMin: number;

  @ViewChild('SearchSlides') SearchSlide: IonSlides;
  public searchSlides = {
    slidesPerColumn: 4,
    speed: 500,
    slidesPerView: 2,
    spaceBetween: 8,
    zoom: false,
    slidesPerColumnFill: 'row',
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
      renderCustom: (swiper, current, total) => {
        return this.customProgressBar(current, total);
      }
    }
  };
  public user: IUser;

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private helper: UtilitiesHelper,
    private navigation: NavigationHelper,
    private platform: Platform
  ) {

    this.configurePlatform();
  }

  ngOnInit() {
    this.configureInit();
    this.configureSlides();

  }

  configureInit() {
    this.showTitle = true;
    this.showBackButton = true;
    this.updatingSlides = true;
    this.firstBranch = true;
    this.message = 'Selecciona una categoría';
    this.title = 'Escoger categoría';
    this.subtitle = 'Navega entre categorías';
    this.storage.get('CashRegisterTree').then(response => {
      this.categories = response;
    });
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
    this.updateSlide('slidesPerColumn', this.slidesMax);

  }

  searchCategory(category: any, updateThreadFilter: boolean, position: any) {
    if (category.issubcategory) {
      this.message = 'Selecciona una subcategoría';
      this.updateCategories(category, category.categories, updateThreadFilter, false, 1 + '.' + position );
      if (category.categories.length === 0) {
        this.navigation.goTo('nuevo-producto', { 'threadFilters': this.threadFilters });
      }
    } else if (category.isbrands) {
      this.message = 'Selecciona una marca';
      this.updateCategories(category, category.brands, updateThreadFilter, false, 2 + '.' + position );
      if (category.brands.length === 0) {
        this.navigation.goTo('nuevo-producto', { 'threadFilters': this.threadFilters });
      }
    } else {
      this.updateCategories(category, null, updateThreadFilter, true, 3 + '.' + position );
      this.navigation.goTo('nuevo-producto', { 'threadFilters': this.threadFilters });
    }
  }

  reconfigureCategories(position: any) {

    this.storage.get('CashRegisterTree').then(response => {
        const force = position.split('.');
        const first = this.threadFilters[0].position.split('.')[1];
        switch (force[0]) {
            case '1':
                this.categories = [];
                this.threadFilters.splice(1, 1);
                this.categories = response[first].categories;
                break;
            case '2':
                this.categories = [];
                this.threadFilters.splice(2, 1);
                this.categories = response[first].categories[force[1]].brands;
                break;

        }
    });
}

  updateCategories(category: any, categories: any, updateThreadFilter: boolean, finalThread: boolean, position: any) {

    this.firstBranch = false;
    this.categories = [];

    if (!finalThread) {
      if (categories.length === 0) {
        this.showNewProduct = true;
      } else {
        this.categories = categories;
        this.updateSlide('slidesPerColumn', this.slidesMin);
      }
    }


    if (updateThreadFilter) {
      const filterData = {
        name: category.name,
        id: category.mysql_id,
        position: position
      };
      this.updateThreadFilter(filterData);
    }

  }
  updateThreadFilter(category: any = []) {
    this.threadFilters.push(category);
  }


  reconfigurePageSearch() {

    this.updatingSlides = true;
    this.firstBranch = true;
    this.showNewProduct = false;

    this.updateSlide('slidesPerColumn', this.slidesMax);
    this.categories = [];
    this.threadFilters = [];
    this.storage.get('CashRegisterTree').then(response => {
      this.categories = response;
    });

  }


  updateSlide(option: string, value: any) {
    this.updatingSlides = false;
    switch (option) {
      case 'slidesPerColumn':
        this.searchSlides.slidesPerColumn = value;
        break;
    }
    setTimeout(() => {
      this.updatingSlides = true;
    }, 400);
  }




}

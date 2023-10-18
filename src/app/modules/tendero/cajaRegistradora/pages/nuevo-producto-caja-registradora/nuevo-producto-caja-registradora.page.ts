import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { IUser } from '../../../../../interfaces/IUser';
import { CashRegisterNewProductState } from '../../store/cash-register.reducer';
import { CashRegisterNewProductAction } from '../../store/cash-register.actions';
import { IProduct } from '../../../../../interfaces/ICashRegisterSale';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';


@Component({
  selector: 'app-nuevo-producto-caja-registradora',
  templateUrl: './nuevo-producto-caja-registradora.page.html',
  styleUrls: ['./nuevo-producto-caja-registradora.page.scss'],
})

export class NuevoProductoCajaRegistradoraPage implements OnInit {
  public title: string;
  public subtitle: string;
  public showTitle: boolean;
  public showBackHomeButton: boolean;
  public user: IUser;
  public dataProduct: FormGroup;
  public threadFilters = [{ name: 'Seleccionar una categoría', id: null }];
  public photoCamera: any;

  public product: IProduct = {
    _id: 0,
    ean: '',
    fullname: '',
    name: '',
    description: '',
    variant: '',
    presentation: '',
    size: 0,
    unit_measurement: 0,
    quantity: 0,
    price: null,
    iva: 0,
    show: false,
    outstanding: false,
    overriding: false,
    order: 0,
    brand_id: 0,
    shopkeeper_id: 0,
    mysql_id: 0,
  };

  constructor(
    private navigation: NavigationHelper,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private storage: Storage,
    private alertController: AlertController,
    public formBuilder: FormBuilder,
    private storeNewProduct: Store<CashRegisterNewProductState>,
    private camera: Camera,
    private file: File
  ) { }

  ngOnInit() {
    this.configureNavigationParams();
    this.configureProduct();
    this.configureInit();
    this.configureForm();
  }

  configureForm() {

    this.dataProduct = this.formBuilder.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z ]*$'),
      ])],
      price: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(7),
        Validators.minLength(2),
      ])]
    });

  }

  configureInit() {
    this.showTitle = true;
    this.showBackHomeButton = true;
    this.title = 'Producto Nuevo';
    this.subtitle = 'Código de barras ';
    this.user = this.route.snapshot.data['user'];
  }

  configureProduct() {
    this.storage.get('CashRegisterNewProduct').then(response => {
      if ( response !== null) {
        this.product = response;
      }
    });
  }

  configureNavigationParams() {
    if (this.navigation.params !== undefined) {
      if (this.navigation.params.state.data.ean !== undefined) {
        this.product.ean = this.navigation.params.state.data.ean;
      }

      if (this.navigation.params.state.data.threadFilters !== undefined) {
        this.threadFilters = this.navigation.params.state.data.threadFilters;
      }
    }
  }

  saveDataProduct() {
    this.storage.set('CashRegisterNewProduct', this.product);

  }

  goToSearchCashRegister(params: any = null) {
    this.navigation.goTo('buscar-caja-registradora', {'eanToSearch': params} );
  }

  goToCashRegister() {
    this.navigation.goTo('caja-registradora');
  }

  goToCatalogue() {
    this.navigation.goTo('catalogo');
  }

  goToSelectCategory() {

    this.analyticsService.sendEvent('cr_select_categoria', {
      'event_category': 'cr_registro_prod_inventario'
    } );

    this.navigation.goTo('seleccionar-categoria');
  }

  cancel() {

    this.analyticsService.sendEvent('cr_registro_prod_nuevo', {
      'event_category': 'cr_registro_prod_inventario',
      'event_label': 'cr_registro_prod_inventario_cancelar/continuar'
    } );

    this.storage.remove('CashRegisterNewProduct');
    this.goToCashRegister();
  }

  confirm() {
    if (this.dataProduct.controls.name.status === 'INVALID') {
      const message = 'Ingresa un nombre válido';
      this.presentAlert(message);
    } else if (this.dataProduct.controls.price.status === 'INVALID') {
      const message = 'Ingresa un precio válido';
      this.presentAlert(message);
    } else if (this.threadFilters[0].id === null) {
      const message = 'Ingreasa la categoría';
      this.presentAlert(message);
    } else {
      this.product.shopkeeper_id = this.user.user_id;
      const NewProduct = new CashRegisterNewProductAction(true, this.user.token, this.product, this.threadFilters, this.photoCamera);
      this.storeNewProduct.dispatch(NewProduct);
      this.goToSearchCashRegister(this.product.ean);
    }

  }

  selectCategory() {
    this.saveDataProduct();
    this.goToSelectCategory();
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: message,
      buttons: ['Aceptar'],
      cssClass: 'attention-alert',
    });
    return await alert.present();
  }

  outstanding() {
    this.product.outstanding = !this.product.outstanding;
    this.product.overriding = false;
  }

  overriding() {
    this.product.overriding = !this.product.overriding;
    this.product.outstanding = false;
  }

  makePhoto() {
    const options: CameraOptions = {
        quality: 35,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 450,
        targetHeight: 700,
        saveToPhotoAlbum: false
    };
    this.camera.getPicture(options).then((img) => {
        this.photoCamera = 'data:image/jpeg;base64,' + img;
    }, (err) => {});
  }

}

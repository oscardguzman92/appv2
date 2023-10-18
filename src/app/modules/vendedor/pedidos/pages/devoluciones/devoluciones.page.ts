import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {GetProductsReturnsService} from '../../../../../services/orders/getProductsReturns.service';
import {Seller} from '../../../../../models/Seller';
import {ActivatedRoute, Router} from '@angular/router';
import {Shop} from '../../../../../models/Shop';
import {Subscription} from 'rxjs';
import {filter, min} from 'rxjs/operators';
import {SET_SEARCH_PRODUCTS, SetSearchProductsAction} from '../../../../compartido/pedidos/store/orders.actions';
import {IProduct} from '../../../../../interfaces/IProduct';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {AlertController, ModalController} from '@ionic/angular';
import {CanComponentDeactivate} from '../../../../../guards/discartDeactivate.guard';
import {jumpAnimation} from '../../../../../animations/jump.animation';
import {Storage} from '@ionic/storage';
import {ConfirmationComponent} from './components/confirmation/confirmation.component';
import {GetMessagesAction} from '../../../../compartido/misMensajes/store/messages.actions';
import {IMotivo} from '../../../../../interfaces/IMotivo';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

@Component({
    selector: 'app-devoluciones',
    templateUrl: './devoluciones.page.html',
    styleUrls: ['./devoluciones.page.scss'] ,
    animations: [jumpAnimation]
})
export class DevolucionesPage implements OnInit, CanComponentDeactivate {
    private showButtonBarcode: boolean;
    private returnActive: boolean;
    public user: Seller;
    public shop: Shop;
    public searchSubs = new Subscription();
    public products: IProduct[];
    public productsInCar: IProduct[];
    public motivos: IMotivo[];
    public orderValue: number;
    public isModified: boolean;
    public countReturn: number;
    public returnValue: number;
    public pedido_id: number;
    public thingState: string;
    public search: string;
    public productActive: IProduct;
    private maxPaginate = 0;
    private nPagePaginate = 2;

    constructor(
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private productsReturn: GetProductsReturnsService,
        private route: ActivatedRoute,
        private router: Router,
        private actionsObj: ActionsSubject,
        private alertCtrl: AlertController,
        private storage: Storage,
        private msgErrorService: MsgErrorService,
        private modal: ModalController) {

        this.returnValue = 0;
        this.countReturn = 0;
        this.user = this.route.snapshot.data['user'];
        if (this.router.getCurrentNavigation().extras.state) {
            const data = this.router.getCurrentNavigation().extras.state.data;
            this.shop = data.shop;
            this.orderValue = data.orderValue;
            this.pedido_id = data.pedido_id;
        }
        if (this.pedido_id) {
            this.loadProducts();
        }

        this.thingState = 'start';
        this.isModified = false;
        this.productsInCar = [];
    }

    ngOnInit() {
        this.storage.remove('productsReturns');
        this.searchSubs = this.actionsObj
            .pipe(filter((res: SetSearchProductsAction) => res.type === SET_SEARCH_PRODUCTS))
            .subscribe(async res => {
                if (res.products.length === 0) {
                    this.store.dispatch(new Fail({mensaje: 'No se encontraron resultados de la búsqueda'}));
                    this.store.dispatch(new LoadingOff());
                    return;
                }
                if (this.products) {
                    this.products = this.products.concat(res.products);
                } else {
                    this.products = res.products;
                }

                this.maxPaginate = res.paginate.last_page;

                await this.compareStorage();
                this.store.dispatch(new LoadingOff());
            });
    }

    ionViewWillLeave() {
        this.storage.remove('productsReturns');
    }

    justBack() {
        this.navigation.justBack();
    }

    focusEvent() {
        this.showButtonBarcode = true;
    }

    blurEvent() {
        this.showButtonBarcode = false;
    }

    searchProducts(search) {
        if (search === '') {
            return;
        }

        if (!this.user.token) {
            return;
        }

        if (!this.shop) {
            return;
        }

        if (!this.shop.id) {
            return;
        }

        if (this.productActive) {
            this.saveStorageProducts(this.productActive);
        }

        this.store.dispatch(new LoadingOn());
        this.search = search;
        this.productsReturn.getProducts(search, this.user.token, this.shop.id, 1);
    }

    async abrirCarrito() {
        if (this.productActive) {
            this.saveStorageProducts(this.productActive);
        }

        const modal = await this.modal.create(<any>{
            component: ConfirmationComponent,
            cssClass: 'shopping-cart',
            componentProps: {
                products: this.productsInCar,
                countReturn: this.countReturn,
                valueReturn: this.returnValue,
                user: this.user,
                pedido_id: this.pedido_id,
                orderValue: this.orderValue,
                shop: this.shop,
                motivos: this.motivos,
                returnActive: this.returnActive
            }
        });

        modal.onDidDismiss().then(res => {
            if (!res) {
                return;
            }

            if (!res.data) {
                return;
            }

            this.returnValue = res.data.value;
            this.countReturn = res.data.count;
            this.productsInCar = res.data.products;

            if (res.data.clear) {
                this.productsInCar = [];
                this.navigation.goTo(this.user.rootPage, {refresh: true});
                return;
            }

            if (!this.products) {
                return;
            }

            for (const product of this.productsInCar) {
                const filterProduct = this.products.filter(item => {
                    return item.producto_distribuidor_id === product.producto_distribuidor_id;
                });

                if (filterProduct.length > 0) {
                    filterProduct[0].cantidad = product.cantidad;
                    this.productActive = filterProduct[0];
                }
            }


        });

        return await modal.present();
    }

    addProd(value) {
        this.isModified = true;
        this.countReturn++;
        this.returnValue += value.value;
        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.returnValue);
        if (diferencie <= minValue) {
            value.product.cantidad--;
            this.countReturn--;
            this.returnValue -= value.value;
            this.store.dispatch(new Fail({
                mensaje: 'La diferencia entre el pedido y la devolución no puede superar el valor de pedido minímo'
            }));
            setTimeout(() => {
                this.store.dispatch(new LoadingOff());
            }, 300);
            return;
        }

        this.addProductCar(value.product, value.product.cantidad)

        if (!this.productActive) {
            this.productActive = value.product;
            return;
        }

        if (this.productActive.id !== value.product.id) {
            this.saveStorageProducts(value.product);
        }
    }

    rmProd(value) {
        this.isModified = true;
        this.returnValue -= value.value;
        this.countReturn --;
        if (this.returnValue <= 0) {
            this.returnValue = 0;
        }

        if (this.countReturn <= 0) {
            this.countReturn = 0;
        }

        this.rmProductCar(value.product.id, value.product.cantidad);

        if (!this.productActive) {
            this.productActive = value.product;
            return;
        }

        if (this.productActive.id !== value.product.id) {
            this.saveStorageProducts(value.product);
        }
    }

    writerProduct() {
        this.returnValue = 0;
        this.countReturn = 0;
        for (const product of this.products) {
            if (product.cantidad > 0) {
                this.countReturn += product.cantidad;
                this.returnValue += (parseFloat(product.precio) * product.cantidad);
            }
        }

        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.returnValue);
        if (diferencie <= minValue) {
            this.store.dispatch(new Fail({
                mensaje: 'La diferencia entre el pedido y la devolución no puede superar el valor de pedido minímo'
            }));
            this.store.dispatch(new LoadingOff());
        }
    }

    blur(product) {
        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.returnValue);
        if (diferencie <= minValue) {
            this.countReturn -= (product.cantidad - 1);
            this.returnValue -= (parseFloat(product.precio) * (product.cantidad - 1));
            product.cantidad = 1;
        }
    }

    async canDeactivate() {
        if (this.productsInCar.length === 0) {
            return  true;
        }

        if (!this.isModified) {
            return  true;
        }

        const confirm = await this.presentAlert();

        return confirm.onDidDismiss().then(res => {
            return res.data;
        });
    }

    loadInfiniteScroll(event) {
        if (this.maxPaginate >= this.nPagePaginate) {
            this.store.dispatch(new LoadingOn());
            this.productsReturn.getProducts(this.search, this.user.token, this.shop.id, this.nPagePaginate);
            this.nPagePaginate++;
            event.target.complete();
        } else {
            event.target.disabled = true;
        }
    }

    private async presentAlert() {
        const confirm = await  this.alertCtrl.create({
            header: 'Información',
            message: 'Los cambios no serán guardados',
            buttons: [
                {
                    text: 'Enviar devolución',
                    handler: () => {
                        this.abrirCarrito();
                        confirm.dismiss(false);
                    }
                },
                {
                    text: 'Salir',
                    handler: () => {
                        confirm.dismiss(true);
                    }
                }
            ]
        });

        confirm.present();

        return confirm;
    }

    private rmProductCar(idProduct, cantidad) {
        this.productsInCar.forEach((productItem, index) => {
            if (productItem.id === idProduct) {
                if (cantidad <= 0) {
                    this.productsInCar.splice(index, 1);
                } else {
                    productItem.cantidad = cantidad;
                }
            }
        });
    }

    private addProductCar(product, cantidad) {
        if (this.productsInCar.length === 0) {
            this.productsInCar.push(product);
        } else {
            let nuevo = true;
            this.productsInCar.forEach((productItem, index) => {
                if (productItem.id === product.id) {
                    nuevo = false;
                    productItem.cantidad = cantidad;
                }
            });

            if (nuevo) {
                this.productsInCar.push(product);
            }
        }
    }

    private saveStorageProducts(product) {
        const arrayProducts = [];
        for (const productItem of this.productsInCar) {
            if (!productItem.precio) {
                productItem.precio = productItem.valor;
            }
            arrayProducts.push({
                productId: productItem.id,
                producto_distribuidor_id: productItem.producto_distribuidor_id,
                cantidad: productItem.cantidad,
                valor: (productItem.precio),
                valor_original: (productItem.precio)
            });
        }
        this.storage.set('productsReturns', JSON.stringify(arrayProducts))
            .then(res => {
                this.productActive = product;
            });
    }

    private compareStorage() {
        return this.storage.get('productsReturns').then(res => {
            if (!res) {
                return false;
            }

            const arrayProducts = JSON.parse(res);
            for (const product of arrayProducts) {
                for (const productSearch of this.products) {
                    if (productSearch.producto_distribuidor_id === product.producto_distribuidor_id && (!product.is)) {
                        productSearch.cantidad = product.cantidad;
                        product.is = true;
                    }
                }
            }

            return true;
        });
    }

    private productsReturnStorage() {
        return this.storage.get('productsReturns').then(res => {
            if (!res) {
                return [];
            }

            const arrayProducts = JSON.parse(res);
            return arrayProducts;
        });
    }

    private loadProducts() {
        this.store.dispatch(new LoadingOn());
        this.productsReturn.getProductsReturn(this.user.token, this.pedido_id)
            .subscribe(async res => {
                let productActive = null;
                if (res.status === 'ok') {
                    if (!res.content) {
                        this.productsInCar = [];
                        this.store.dispatch(new LoadingOff());
                        return;
                    }

                    if (!res.content.pedido) {
                        this.productsInCar = [];
                        this.store.dispatch(new LoadingOff());
                        return;
                    }

                    if (res.content.motivos) {
                        this.motivos = res.content.motivos;
                    }

                    if (!res.content.pedido.productos) {
                        this.productsInCar = [];
                        this.store.dispatch(new LoadingOff());
                        return;
                    }

                    this.returnActive = true;

                    for (const product of res.content.pedido.productos) {
                        this.countReturn += parseInt(product.cantidad);
                        this.returnValue += (parseFloat(product.valor) * parseInt(product.cantidad));
                        this.addProductCar(product, parseInt(product.cantidad));
                        productActive = product;
                    }
                    this.saveStorageProducts(productActive);
                    this.store.dispatch(new LoadingOff());
                } else {
                    let msg = await this.msgErrorService.getErrorIntermitencia();
                    this.store.dispatch(new Fail({mensaje: msg}));
                    this.store.dispatch(new LoadingOff());
                }
            }, async err => {
                let msg = await this.msgErrorService.getErrorIntermitencia();
                this.store.dispatch(new Fail({mensaje: msg}));
                this.store.dispatch(new LoadingOff());
            }, () => {
                this.store.dispatch(new LoadingOff());
            });
    }
}

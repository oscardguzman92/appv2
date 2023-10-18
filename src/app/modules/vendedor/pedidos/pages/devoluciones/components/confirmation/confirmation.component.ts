import { ApiService } from 'src/app/services/api/api.service';
import {Component, Input, OnInit} from '@angular/core';
import {IProduct} from '../../../../../../../interfaces/IProduct';
import {ModalController, ToastController} from '@ionic/angular';
import {UtilitiesHelper} from '../../../../../../../helpers/utilities/utilities.helper';
import {LoadingOff, LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {OrdersService} from '../../../../../../../services/orders/orders.service';
import {Fail} from '../../../../../../compartido/general/store/actions/error.actions';
import {Storage} from '@ionic/storage';
import {Seller} from '../../../../../../../models/Seller';
import {Shop} from '../../../../../../../models/Shop';
import {IMotivo} from '../../../../../../../interfaces/IMotivo';
import { Roles } from 'src/app/enums/roles.enum';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
    @Input() products: IProduct[];
    @Input() motivos: IMotivo[];
    @Input() countReturn: number;
    @Input() pedido_id: number;
    @Input() valueReturn: number;
    @Input() orderValue: number;
    @Input() user: Seller;
    @Input() shop: Shop;
    @Input() returnActive: boolean;
    public comment: string;
    public error: boolean;

    constructor(private modal: ModalController,
        private util: UtilitiesHelper,
        private store: Store<AppState>,
        private apiService: ApiService,
        private orderService: OrdersService,
        private storage: Storage,
        private toastController: ToastController,
        private msgErrorService: MsgErrorService,
    ) {

        this.comment = '0';
        this.error = false;
    }

    ngOnInit() {
    }

    closeCar(clearProduct?) {
        return this.modal.dismiss({
            count: this.countReturn,
            value: this.valueReturn,
            clear: !!(clearProduct),
            products: this.products
        });
    }

    getFullProductName(product) {
        return this.util.getFullProductName(product);
    }

    addToCart(value) {
        this.countReturn++;
        value.cantidad ++;

        this.valueReturn += parseFloat(value.precio);

        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.valueReturn);
        if (diferencie <= minValue) {
            value.cantidad--;
            this.countReturn--;
            this.valueReturn -= parseFloat(value.precio);
            this.store.dispatch(new Fail({
                mensaje: 'La diferencia entre el pedido y la devolución no puede superar el valor de pedido minímo'
            }));
            return;
        }
    }

    rmToCart(value, i) {
        this.valueReturn -= parseFloat(value.precio);
        this.countReturn --;
        value.cantidad --;

        if (value.cantidad === 0) {
            this.products.splice(i, 1);

            if (this.products.length === 0) {
                this.closeCar();
            }
        }
    }

    changeCountProd() {
        this.valueReturn = 0;
        this.countReturn = 0;
        for (const productItem of this.products) {
            if (productItem.cantidad > 0) {
                this.countReturn += productItem.cantidad;
                this.valueReturn += (parseFloat(productItem.precio) * productItem.cantidad);
            }
        }

        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.valueReturn);
        if (diferencie <= minValue) {
            this.store.dispatch(new Fail({
                mensaje: 'La diferencia entre el pedido y la devolución no puede superar el valor de pedido minímo'
            }));

        }
    }

    blur(cantidad, i) {
        if (cantidad === 0 || cantidad === null) {
            this.products.splice(i, 1);

            if (this.products.length === 0) {
                this.closeCar();
            }
        }

        let minValue = 0;
        if (this.user.distribuidor) {
            minValue = (this.user.distribuidor.valor_minimo_compra) ? this.user.distribuidor.valor_minimo_compra : 0;
        }

        const diferencie = (this.orderValue - this.valueReturn);
        if (diferencie <= minValue) {
            this.countReturn -= (this.products[i].cantidad - 1);
            this.valueReturn -= (parseFloat(this.products[i].precio) * (this.products[i].cantidad - 1));
            this.products[i].cantidad = 1;
        }
    }

    async createReturn() {
        if (!this.comment || (parseInt(this.comment) === 0)) {
            this.error = true;
            return;
        }

        this.store.dispatch(new LoadingOn());
        await this.saveStorageProducts();
        const params = {
            productos: await this.productsReturnStorage(),
            pedido_id: this.pedido_id,
            token: this.user.token,
            motivo_id: this.comment
        };

        return this.orderService.setReturn(params)
            .subscribe(async res => {
                if (res.status === 'ok') {
                    this.storage.get('user').then(exito => {
                        const shops = JSON.parse(exito);
                        const indexShopUser = shops.tiendas.findIndex(e => e.id === this.shop.id);

                        const shop = shops.tiendas[indexShopUser];
                        shop.devolucion = 1;
                        shops.tiendas[indexShopUser] = shop;
                        this.storage.set('user', JSON.stringify(shops))
                            .then(() => {
                                this.closeCar(true).then(response => {
                                    this.presentToastWithOptions('La devolución se realizó con exito').then(() => {
                                        this.store.dispatch(new LoadingOff);
                                    });
                                });
                            });
                    });
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

    writeComment() {
        this.error = (parseInt(this.comment) === 0);
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

    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000
        });
        toast.present();
    }

    private saveStorageProducts() {
        const arrayProducts = [];
        for (const productItem of this.products) {
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
        return this.storage.set('productsReturns', JSON.stringify(arrayProducts));
    }
}

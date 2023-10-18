import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonSlides, ModalController, ToastController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {Store} from '@ngrx/store';
import {Roles} from 'src/app/enums/roles.enum';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {IProduct} from 'src/app/interfaces/IProduct';
import {IUser} from 'src/app/interfaces/IUser';
import {Shop} from 'src/app/models/Shop';
import {
    LoadingOff,
    LoadingOn,
} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {GetOrderDetailAction} from 'src/app/modules/compartido/pedidos/store/orders.actions';
import {MsgErrorService} from 'src/app/services/api/msg-error.service';
import {CashRegisterService} from 'src/app/services/orders/cash-register.service';
import {AppState} from 'src/app/store/app.reducer';

@Component({
    selector: 'app-modal-pedido-en-conflicto',
    templateUrl: './modal-pedido-en-conflicto.component.html',
    styleUrls: ['./modal-pedido-en-conflicto.component.scss'],
})
export class ModalPedidoEnConflictoComponent implements OnInit {
    public Roles = Roles;
    @Input() user: IUser;
    @Input() shop: Shop;
    @Input() with_send: boolean = false;
    public tutorial: boolean = false;
    public showSkip: boolean = true;
    public productos_sel: Array<{
        producto_c?: IProduct;
        producto_v?: IProduct;
    }> = [];
    public slideOpts = {
        initialSlide: 0,
        speed: 400,
    };
    @ViewChild('sliderRef') protected slides: IonSlides;

    constructor(
        private store: Store<AppState>,
        public cashService: CashRegisterService,
        public toastController: ToastController,
        public modalController: ModalController,
        private msgErrorService: MsgErrorService,
        private utilities: UtilitiesHelper,
        private storage: Storage,
    ) {
    }

    ngOnInit() {
        this.showTutorialInitial();
    }

    async showTutorialInitial() {
        let noMostrar = await this.storage.get('tutorial_pedido_conflicto_no_mostrar');
        if (!noMostrar) {
            this.tutorial = true;
        }

        this.slides.update().then(() => {this.getOrder();});
    }

    getOrder() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(
            new GetOrderDetailAction(
                this.user.token,
                this.shop.id,
                true,
                async (pedido) => {
                    this.store.dispatch(new LoadingOff());
                    if (this.shop.productos_seleccionados == undefined || Object.keys(this.shop.productos_seleccionados).length == 0) {
                        let json = await this.storage.get('order');
                        json = JSON.parse(json);
                        json.forEach(async (element) => {
                            if (element.id == this.shop.id) {
                                this.shop.productos_seleccionados = element.productos_seleccionados;
                                return;
                            }
                        });
                    }
                    if (!pedido || pedido.length == 0 || this.shop.productos_seleccionados == undefined || Object.keys(this.shop.productos_seleccionados).length == 0) {
                        this.closeModal();
                        return this.presentToastWithOptions('Lo sentimos, el pedido ya no se encuentra en conflicto');
                    }

                    let prod_vend: Array<IProduct> = Object.values(
                        this.shop.productos_seleccionados
                    );
                    prod_vend.forEach((prodV) => {
                        prodV.selected_merge = true;
                        this.productos_sel.push({
                            producto_v: prodV,
                        });
                    });

                    let prod_tendero: Array<IProduct> = pedido[0].productos;
                    prod_tendero.forEach((prodC) => {
                        let indexProdMerge = this.productos_sel.findIndex(
                            (p) => p.producto_v && p.producto_v.id == prodC.id
                        );
                        if (indexProdMerge >= 0) {
                            this.productos_sel[
                                indexProdMerge
                            ].producto_v.selected_merge = true;
                            prodC.selected_merge = true;
                            this.productos_sel[indexProdMerge].producto_c =
                                prodC;
                        } else {
                            let indexProdMergeCli = this.productos_sel.findIndex(
                                (p) => p.producto_c && p.producto_c.id == prodC.id
                            );
                            if (indexProdMergeCli !== 0) {
                                prodC.selected_merge = true;
                                this.productos_sel.push({
                                    producto_c: prodC,
                                });
                            }
                        }
                        if (indexProdMerge >= 0 && prodC.cantidad == this.productos_sel[indexProdMerge].producto_v.cantidad) {
                            delete this.productos_sel[indexProdMerge].producto_c;
                            return;
                        }
                    });
                }
            )
        );
    }

    selectProd(i, tipo) {
        if (tipo == 'c') {
            this.productos_sel[i].producto_c.selected_merge =
                !this.productos_sel[i].producto_c.selected_merge;
        } else {
            this.productos_sel[i].producto_v.selected_merge =
                !this.productos_sel[i].producto_v.selected_merge;
        }
    }

    confirm() {
        if (this.with_send) {
            this.sendOrder();
        } else {
            let productos = this.getProductsSelectedMerge();
            this.modalController.dismiss({
                productos: productos
            });
        }
    }

    async sendOrder() {
        this.store.dispatch(new LoadingOn());
        let productos = this.getProductsSelectedMerge();
        if (!productos || productos.length == 0) {
            return this.presentToastWithOptions('Debes seleeccionar por lo menos un producto');
        }
        this.cashService.setOrder(productos, this.shop, true).subscribe(
            async (success) => {
                if (success === false) {
                    return;
                }
                this.store.dispatch(new LoadingOff());
                if (success.status == 'ok' && success.code == 0) {
                    const productsObj = {};
                    const orderProducts = productos;
                    orderProducts.reduce(function (acc, cur, i) {
                        productsObj[cur.id] = cur;
                        return acc;
                    }, {});
                    this.shop.productos_seleccionados = productsObj;
                    this.shop.pedido = success.content.pedido_id;
                    const message =
                        'El pedido #' +
                        success.content.pedido_id +
                        ' ha sido realizado. se enviará al sistema ' +
                        success.content.fecha_envio;
                    this.presentToastWithOptions(message);
                    this.cashService.clearSelectedOrder(
                        this.shop,
                        null,
                        null,
                        async () => {
                            await this.utilities.setStatusConflictoStorage(this.shop, success.content.pedido_id);
                            this.modalController.dismiss({
                                pedido_id: success.content.pedido_id,
                            });
                        }
                    );
                } else if (success.content && success.content.error) {
                    this.presentToastWithOptions(success.content.error);
                } else if (success.content && success.content) {
                    this.presentToastWithOptions(success.content);
                } else {
                    let msg =
                        await this.msgErrorService.getErrorIntermitencia();
                    this.presentToastWithOptions(msg);
                }
            },
            async (error) => {
                let msg = await this.msgErrorService.getErrorIntermitencia();
                this.presentToastWithOptions(msg);
                this.store.dispatch(new LoadingOff());
            }
        );
    }

    private getProductsSelectedMerge() {
        let productos: Array<IProduct> = [];
        let productos_sel_temp: Array<any> = JSON.parse(JSON.stringify(this.productos_sel));
        productos_sel_temp.forEach((prod, prod_i, prod_o) => {
            if (
                prod.producto_c &&
                prod.producto_c.selected_merge &&
                prod.producto_v &&
                prod.producto_v.selected_merge
            ) {
                prod.producto_v.cantidad += prod.producto_c.cantidad;
                productos.push(prod.producto_v);
            } else if (prod.producto_c && prod.producto_c.selected_merge) {
                productos.push(prod.producto_c);
            } else if (prod.producto_v && prod.producto_v.selected_merge) {
                productos.push(prod.producto_v);
            }
        });
        return productos;
    }

    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            duration: 3000,
        });
        toast.present();
    }

    noShowTutorial() {
        this.tutorial = false;
        this.storage.set('tutorial_pedido_conflicto_no_mostrar', true);
    }

    closeModal() {
        this.tutorial = false;
        this.modalController.dismiss({});
    }

    showTutorial() {
        this.slides.slideTo(0, 0);
        this.tutorial = true;
    }

    hideTutorial() {
        this.tutorial = false;
    }

    skipTutorial() {
        this.slides.length().then(l => {
            this.slides.slideTo(l - 1, 800);
        });
    }

    async changeSlide(e) {
        this.slides.isEnd().then(isEnd => {
            this.showSkip = !isEnd;
        })
    }
}

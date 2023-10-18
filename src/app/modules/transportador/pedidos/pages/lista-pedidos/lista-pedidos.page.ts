import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {IRoute} from '../../../../../interfaces/IRoute';
import {IOrder, IProducto} from '../../../../../services/orders/orders.service';
import {IonSlides, ModalController} from '@ionic/angular';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
import {TransporterService} from '../../../../../helpers/transporter/transporter.service';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {
    FINISH_ORDER_TRANSPORTER, FinishSetOrderPurchaseTransporter, FinishSetReasonTransporterAction,
    SET_ORDER_TRANSPORTER,
    SetOrderPurchaseTransporter,
    SetReasons
} from '../../../compartido/store/transporter.actions';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ICredit} from '../../../../../interfaces/ICredit';
import {Fail} from '../../../../compartido/general/store/actions/error.actions';
import {CurrencyPipe} from '@angular/common';
import {CashRegisterService} from '../../../../../services/orders/cash-register.service';
import {ModalContactoComponent} from '../../../compartido/components/modal-contacto/modal-contacto.component';
import {Transportador} from '../../../../../models/Transportador';
import {Storage} from '@ionic/storage';

@Component({
    selector: 'app-lista-pedidos',
    templateUrl: './lista-pedidos.page.html',
    styleUrls: ['./lista-pedidos.page.scss'],
})
export class ListaPedidosPage implements OnInit {
    @ViewChild('slides') slides: IonSlides;

    @ViewChild('cashInput') cashInput;
    @ViewChild('creditstoreappInput') creditstoreappInput;
    @ViewChild('creditInput') creditInput;

    public user: Transportador;
    public ruta: IRoute;
    public index: number;
    public selectedCash: boolean;
    public selectedCredit: boolean;
    public selectedCreditstoreapp: boolean;
    public selectedMethod: boolean;

    public math = Math;

    public amountCash: number;
    public amountstoreappCredit: number;
    public balance: number;
    public saldo: number;
    public totalMethods: number;

    public pedidoSeleccionado: {
        orden: number;
        pedido: IOrder;
        entregado?: boolean;
    };

    public slideOpts = {
        slidesPerView: 'auto',
        spaceBetween: 0,
        initialSlide: 0
    };
    public slideOptsPayments = {
        freeMode: true,
        spaceBetween: 6,
    };

    orderSubs = new Subscription();
    finishSubs = new Subscription();
    public credits: ICredit[];
    public activeMethodPay = false;
    public returns = false;

    constructor(private route: ActivatedRoute,
        private navigation: NavigationHelper,
        private router: Router,
        private util: UtilitiesHelper,
        private transportadorService: TransporterService,
        private store: Store<AppState>,
        private actionsS: ActionsSubject,
        private currency: CurrencyPipe,
        private cashRegisterService: CashRegisterService,
        private modalController: ModalController,
        private storage: Storage) {
        this.user = this.route.snapshot.data['user'];
        this.balance = 0;
        this.amountstoreappCredit = 0;
        this.amountCash = 0;
        this.totalMethods = 0;
        this.saldo = 0;
        if (this.router.getCurrentNavigation().extras.state) {
            this.ruta = this.router.getCurrentNavigation().extras.state.data.ruta;
            this.credits = this.router.getCurrentNavigation().extras.state.data.credits;
            this.saldo = this.router.getCurrentNavigation().extras.state.data.saldo;
            this.activeMethodPay = this.credits.length > 0;
            this.pedidoSeleccionado = this.router.getCurrentNavigation().extras.state.data.pedidoSeleccionado;
            this.index = this.router.getCurrentNavigation().extras.state.data.index;
            this.slideOpts.initialSlide = this.index;
            this.payMethod();
        }
    }

    ionViewWillEnter() {
        this.orderSubs = this.actionsS
            .pipe(filter(res => res.type === FINISH_ORDER_TRANSPORTER))
            .subscribe((res: FinishSetOrderPurchaseTransporter) => {
                this.entrega(res.rutas);
            });
    }

    ngOnInit() {
    }

    async changeEvent() {
        const isEnd = await this.slides.isEnd();
        const index = (isEnd) ? (await this.slides.length()) - 1 : await this.slides.getActiveIndex();
        this.pedidoSeleccionado = this.ruta.pedidos[index];
        this.payMethod();
    }

    goBack() {
        this.navigation.goToBack(this.user.rootPage);
    }

    getFullProductName(product) {
        return this.util.getFullProductName(product);
    }

    addToCart(product) {
        const cantidad = product.cantidad + 1;
        if (cantidad > product.cantidad_original) {
            return;
        }

        product.cantidad++;

        this.calcValue();
    }

    rmToCart(product) {
        product.cantidad--;

        if (product.cantidad <= 0) {
            product.cantidad = 0;
        }

        this.calcValue();
    }

    payMethod() {
        this.selectedCash = false;
        this.selectedCredit = false;
        this.selectedCreditstoreapp = false;
        this.amountCash = 0;
        this.amountstoreappCredit = 0;
        this.balance = 0;
        if (this.saldo) {
            this.balance = +this.saldo;
            if (this.balance > 0) {
                this.amountstoreappCredit = this.balance;
            }
        }

        for (const credit of this.credits) {
            if (credit.selectedPay) {
                continue;
            }

            if (!credit.selectedPay) {
                credit.amountPay = credit.quota - credit.debt;
            }
        }

        this.totalMethods = 0;
        if (!this.pedidoSeleccionado.pedido || (this.pedidoSeleccionado.pedido && !this.pedidoSeleccionado.pedido.compra)) {
            this.selectedCash = true;
            this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
            this.totalMethods += this.pedidoSeleccionado.pedido.valor_pedido;
            return;
        }

        if (!this.pedidoSeleccionado.pedido.compra.metodos_pago) {
            this.selectedCash = true;
            this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
            this.totalMethods += this.pedidoSeleccionado.pedido.valor_pedido;
            return;
        }

        for (const metodo of this.pedidoSeleccionado.pedido.compra.metodos_pago) {
            if (metodo.id_tipo_metodo === 1) {
                this.selectedCash = true;
                this.amountCash = parseFloat(metodo.monto.toString());
                this.totalMethods += this.amountCash;
                continue;
            }

            if ((metodo.id_tipo_metodo === 2)) {
                this.selectedCreditstoreapp = true;
                this.amountstoreappCredit = parseFloat(metodo.monto.toString());
                this.balance += parseFloat(metodo.monto.toString());
                this.totalMethods += this.amountstoreappCredit;
                continue;
            }

            if ((metodo.id_tipo_metodo === 3)) {
                this.credits.forEach((object, count) => {
                    if (object.credit_id === metodo.id_credito) {
                        this.credits[count].selectedPay = true;
                        this.credits[count].feePay = metodo.cuotas;
                        this.credits[count].amountPay = metodo.monto;
                        this.totalMethods += parseFloat(metodo.monto.toString());
                    }
                });
                this.selectedCredit = true;
                break;
            }

            this.selectedCredit = (metodo.id_tipo_metodo === 3 || this.selectedCredit);
        }
    }

    changeMethodPay() {
        this.selectedMethod = true;
    }

    public selectCash() {
        this.cashInput.setFocus();
        this.selectedCash = !this.selectedCash;

        if ((!this.selectedCredit && !this.selectedCreditstoreapp) && !this.selectedCash) {
            this.selectedCash = true;
            this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
            return;
        }
    }

    public selectstoreappCredit() {
        this.creditstoreappInput.setFocus();
        this.selectedCreditstoreapp = !this.selectedCreditstoreapp;

        if (this.selectedCreditstoreapp) {
            if (this.selectedCash && (Math.round(this.amountCash) > Math.round(this.amountstoreappCredit))) {
                this.amountCash -= this.amountstoreappCredit;
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                return;
            }

            if ((Math.round(this.amountCash) <= Math.round(this.amountstoreappCredit))) {
                this.amountCash = 0;
                this.onlystoreapp();
                this.updateDataCash({target: {value: this.amountCash.toString()}});

                if (this.amountstoreappCredit > this.pedidoSeleccionado.pedido.valor_pedido) {
                    this.amountstoreappCredit = this.pedidoSeleccionado.pedido.valor_pedido;
                }

                return;
            }
        }

        if (!this.selectedCreditstoreapp) {
            if (this.selectedCash) {
                this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
            }

            if (!this.selectedCash && !this.selectedCredit) {
                this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
                this.selectedCash = true;
                this.amountstoreappCredit = this.balance;
            }

            this.updateDataCash({target: {value: this.amountCash.toString()}});
            return;
        }
    }

    public selectCredit(index: number) {
        this.creditInput.setFocus();
        this.credits[index].selectedPay = !this.credits[index].selectedPay;
        this.activeCredit(this.selectedCreditstoreapp);
        this.calcMethodValue();
        if (this.credits[index].selectedPay) {

            if (Math.round(this.totalMethods) > Math.round(this.pedidoSeleccionado.pedido.valor_pedido)) {
                this.onlyCredit(this.credits[index]);
            }

            if ((Math.round(this.pedidoSeleccionado.pedido.valor_pedido) > Math.round(this.credits[index].amountPay))) {
                const diff = Math.round(this.pedidoSeleccionado.pedido.valor_pedido) - Math.round(this.credits[index].amountPay);
                this.amountCash = diff;
                this.selectedCash = true;
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                return;
            }

            if ((Math.round(this.pedidoSeleccionado.pedido.valor_pedido) < Math.round(this.credits[index].amountPay))) {
                this.onlyCredit(this.credits[index]);
                this.amountCash = 0;
                this.updateDataCash({target: {value: this.amountCash.toString()}});

                if (this.amountstoreappCredit > this.pedidoSeleccionado.pedido.valor_pedido) {
                    this.amountstoreappCredit = this.pedidoSeleccionado.pedido.valor_pedido;
                }

                return;
            }
        }

        if (!this.credits[index].selectedPay) {
            if (this.selectedCash) {
                this.amountCash = this.pedidoSeleccionado.pedido.valor_pedido;
            }
            this.onlyCash();
            this.updateDataCash({target: {value: this.amountCash.toString()}});
            return;
        }
    }

    public activeCredit(init) {
        let activeCredit = init;
        for (let y = 0; y < this.credits.length; y++) {
            const element = this.credits[y];
            if (element.selectedPay) {
                activeCredit = true;
            }
        }
        this.selectedCredit = activeCredit;
    }

    confirmMethodPay() {
        /* creditos */
        let amountTotal = 0;
        let amountNull = true;
        let methodPayNull = true;
        const totalMet = Math.round(this.pedidoSeleccionado.pedido.valor_pedido);
        this.totalMethods = 0;

        methodPayNull = (this.selectedCash || this.selectedCredit || this.selectedCreditstoreapp);
        amountTotal += this.selectedCash ? parseFloat(this.amountCash.toString()) : null;
        this.totalMethods = amountTotal;
        if (!this.selectedCash) {
            this.amountCash = 0;
        }

        if (this.selectedCreditstoreapp) {
            // tslint:disable-next-line: max-line-length
            this.amountstoreappCredit = (this.amountstoreappCredit === null || this.amountstoreappCredit === NaN || this.amountstoreappCredit === undefined || this.amountstoreappCredit < 0) ? 0 : this.amountstoreappCredit;

            if (this.amountstoreappCredit > +this.balance) {
                this.amountstoreappCredit = +this.balance;
            }
            amountTotal += parseFloat(this.amountstoreappCredit.toString());
            this.totalMethods = amountTotal;
        }

        if (this.activeMethodPay && this.selectedCredit) {
            this.credits.forEach((element) => {
                if (element.selectedPay) {
                    if (element.amountPay > element.quota - element.debt) {
                        element.amountPay = element.quota - element.debt;
                    }
                    // tslint:disable-next-line: max-line-length
                    element.amountPay = (element.amountPay === null || element.amountPay === NaN || element.amountPay === undefined || element.amountPay < 0) ? 0 : element.amountPay;
                    amountTotal += parseFloat(element.amountPay.toString());
                    if (element.feePay === 0) {
                        element.feePay = 1;
                    }
                    amountNull = element.amountPay === null ? true : false;
                }
            });
            this.totalMethods = amountTotal;
        }

        if (!methodPayNull) {
            this.store.dispatch(new Fail({mensaje: 'Debes seleccionar algun metodo de pago', withoutLoading: true}));
            return;
        }

        if (amountTotal < totalMet) {
            this.store.dispatch(new Fail( {
                mensaje: 'Hace falta ' + this.currency.transform(
                    (totalMet - amountTotal), 'COP', 'symbol-narrow', '0.0-0') + ' para completar el pago',
                withoutLoading: true
            }));
            return;
        }

        if (amountTotal > totalMet) {
            this.store.dispatch(new Fail({
                mensaje: 'Sobra ' + this.currency.transform(
                    (amountTotal - totalMet), 'COP', 'symbol-narrow', '0.0-0') + ' para completar el pago',
                withoutLoading: true
            }));
            return;
        }

        this.selectedMethod = false;
    }

    sendOrder() {
        if (this.returns) {
            this.util.alertOrderOnlyAcceptHandle('Se realizará una devolución, ¿Deseas continuar?', () => {
                this.execSendOrder(true);
            });
            return;
        }
        this.execSendOrder();
    }

    ionViewDidLeave() {
        this.orderSubs.unsubscribe();
    }

    updateDataCash($event, blur = false) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput === '')) ? '0' : valueInput.replace(/\D/g, ''), res;
        if ((this.pedidoSeleccionado.pedido.valor_pedido > parseFloat(value) &&
            (!this.selectedCredit && !this.selectedCreditstoreapp)) && blur) {
            value = this.pedidoSeleccionado.pedido.valor_pedido;
            res = this.validateMethodsCash(value, blur);
            value = (res) ? res : value;
            return value;
        }

        if (this.pedidoSeleccionado.pedido.valor_pedido < parseFloat(value)) {
            value = this.pedidoSeleccionado.pedido.valor_pedido;
            res = this.validateMethodsCash(value, blur);
            value = (res) ? res : value;
            return value;
        }

        res = this.validateMethodsCash(value, blur);
        value = (res) ? res : value;
        return value.replace(/[^0-9.]/g, '');
    }

    validateMethodsCash(value, blur) {
        if (!value) {
            return false;
        }

        if (!blur) {
            return false;
        }

        if (!this.selectedCreditstoreapp) {
            return false;
        }

        if ((Math.round(this.amountstoreappCredit) + Math.round(value)) > Math.round(this.pedidoSeleccionado.pedido.valor_pedido)) {
            if (Math.round(this.amountstoreappCredit) > Math.round(value)) {
                const diff = ((parseFloat(this.amountstoreappCredit.toString()) + parseFloat(value)))
                    - this.pedidoSeleccionado.pedido.valor_pedido;
                this.amountstoreappCredit -= parseFloat(diff.toString());
                return false;
            }
            if (Math.round(this.amountstoreappCredit) <= Math.round(value)) {
                const diff = ((parseFloat(this.amountstoreappCredit.toString()) + parseFloat(value)))
                    - this.pedidoSeleccionado.pedido.valor_pedido;
                if (Math.round(this.amountCash) + Math.round(diff) < this.pedidoSeleccionado.pedido.valor_pedido) {
                    this.amountCash += parseFloat(value);
                }

                this.amountstoreappCredit -= diff;

                if (this.amountstoreappCredit <= 0) {
                    this.amountstoreappCredit = this.balance;
                    this.selectedCreditstoreapp = false;
                }

                return this.amountCash;
            }
        } else if ((Math.round(this.amountstoreappCredit) + Math.round(value))
            < Math.round(this.pedidoSeleccionado.pedido.valor_pedido)) {
            const diff = (this.pedidoSeleccionado.pedido.valor_pedido
                - (parseFloat(this.amountstoreappCredit.toString()) + parseFloat(value)));
            this.amountCash = parseFloat(this.amountCash.toString()) + parseFloat(diff.toString());
            return this.amountCash.toString();
        }
    }

    updateDataCreditstoreapp($event, blur = false) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput === '')) ? '0' : valueInput.replace(/\D/g, '');

        if (parseFloat(this.balance.toString()) < parseFloat(value)) {
            value = this.balance.toString();
        }

        if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) < parseFloat(value)) {
            value = this.pedidoSeleccionado.pedido.valor_pedido.toString();
        }

        if (blur) {
            const totalM = this.calcMethodValue();
            if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) < parseFloat(totalM.toString())) {
                this.amountCash = this.totalMethods;
                this.onlyCash();
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                value = this.balance.toString();
            }

            if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) > parseFloat(totalM.toString())) {
                const diff = parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) - parseFloat(totalM.toString());
                this.amountCash = parseFloat(this.amountCash.toString()) + diff;
                this.selectedCash = true;
                this.amountstoreappCredit = value.replace(/[^0-9.]/g, '');
                this.updateDataCash({target: {value: this.amountCash.toString()}});
            }
        }

        return value.replace(/[^0-9.]/g, '');
    }

    updateDataCredit($event, blur, credit) {
        const valueInput = $event.target.value;
        let value = (!valueInput || (valueInput && valueInput === '')) ? '0' : valueInput.replace(/\D/g, '');
        const dis = credit.quota - credit.debt;

        if (parseFloat(dis.toString()) < parseFloat(value)) {
            value = dis.toString();
        }

        if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) < parseFloat(value)) {
            value = this.pedidoSeleccionado.pedido.valor_pedido.toString();
        }

        if (blur) {
            const totalM = this.calcMethodValue();
            if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) < parseFloat(totalM.toString())) {
                this.amountCash = this.totalMethods;
                this.onlyCash();
                this.updateDataCash({target: {value: this.amountCash.toString()}});
                value = this.balance.toString();
            }

            if (parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) > parseFloat(totalM.toString())) {
                const diff = parseFloat(this.pedidoSeleccionado.pedido.valor_pedido.toString()) - parseFloat(totalM.toString());
                this.amountCash = parseFloat(this.amountCash.toString()) + diff;
                this.selectedCash = true;
                credit.amountPay = value.replace(/[^0-9.]/g, '');
                this.updateDataCash({target: {value: this.amountCash.toString()}});
            }
        }

        return value.replace(/[^0-9.]/g, '');
    }

    calcMethodValue() {
        this.totalMethods = 0;
        if (this.selectedCash) {
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(this.amountCash.toString());
        }

        if (this.selectedCreditstoreapp) {
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(this.amountstoreappCredit.toString());
        }

        for (const credit of this.credits) {
            if (!credit.selectedPay) {
                continue;
            }
            this.totalMethods = parseFloat(this.totalMethods.toString()) + parseFloat(credit.amountPay.toString());
        }

        return this.totalMethods;
    }

    onlyCash() {
        this.selectedCash = true;
        this.selectedCreditstoreapp = false;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
        this.selectedCredit = false;
    }

    onlystoreapp() {
        this.selectedCash = false;
        this.selectedCreditstoreapp = true;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
    }

    onlyCredit(creditCurrent) {
        this.selectedCash = false;
        this.selectedCreditstoreapp = false;
        for (const credit of this.credits) {
            credit.selectedPay = false;
        }
        creditCurrent.selectedPay = true;
    }

    openWaze() {
        window.open('https://waze.com/ul?ll=' +
            this.pedidoSeleccionado.pedido.tienda.latitud + ',' + this.pedidoSeleccionado.pedido.tienda.longitud + '&navigate=yes'
        );
    }

    async openContactModal() {
        const modal = await this.modalController.create({
            component: ModalContactoComponent,
            cssClass: ['modal-info', 'modal-updates'],
            componentProps: {
                tel: this.pedidoSeleccionado.pedido.tienda.cliente.telefono_contacto
            }
        });

        return modal.present();
    }

    private calcValue() {
        this.pedidoSeleccionado.pedido.valor_pedido = 0;
        this.pedidoSeleccionado.pedido.valor_sin_iva = 0;
        this.pedidoSeleccionado.pedido.iva = 0;
        this.pedidoSeleccionado.pedido.productos.forEach(product => {
            if (+product.valor < +product.precio_unitario || isNaN(product.precio_unitario)) {
                product.precio_unitario = product.valor;
            }
            product.valor = product.valor ? product.valor : 0;

            this.pedidoSeleccionado.pedido.valor_pedido += product.cantidad * +product.valor;
            this.pedidoSeleccionado.pedido.valor_sin_iva += product.cantidad * +product.precio_unitario;
            this.pedidoSeleccionado.pedido.iva =
                (this.pedidoSeleccionado.pedido.valor_pedido - this.pedidoSeleccionado.pedido.valor_sin_iva);

            if (product.cantidad !== product.cantidad_original) {
                this.returns = true;
            }
        });
    }

    private execSendOrder(returns: boolean = false) {
        const params = this.transportadorService.createOrder(
            this.user.token,
            this.pedidoSeleccionado.pedido.id,
            this.pedidoSeleccionado.pedido.valor_pedido,
            this.pedidoSeleccionado.pedido.tienda.cliente.user_id,
            this.pedidoSeleccionado.pedido.productos,
            returns,
            {selected: this.selectedCash, amount: this.amountCash},
            {selected: this.selectedCreditstoreapp, amount: this.amountstoreappCredit},
            this.credits
        );

        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SetOrderPurchaseTransporter(this.user.token, params));
    }

    private async entrega(rutas: IRoute[]) {
        this.user.rutas = rutas;
        await this.storage.set('user', JSON.stringify(this.user));
        this.store.dispatch(new LoadingOff());
        this.util.alertOrderOnlyWithoutCancel('El pedido fue entregado correctamente', () => {
            this.navigation.goTo(this.user.rootPage);
        });
    }
}

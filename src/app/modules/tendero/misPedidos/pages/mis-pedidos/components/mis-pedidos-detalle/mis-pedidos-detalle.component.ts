import {Component, OnInit, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import { Roles } from 'src/app/enums/roles.enum';

@Component({
    selector: 'app-mis-pedidos-detalle',
    templateUrl: './mis-pedidos-detalle.component.html',
    styleUrls: ['./mis-pedidos-detalle.component.scss'],
})
export class MisPedidosDetalleComponent implements OnInit {
    @Input('order') order;
    @Input('user') user: any; 
    public products: any[] = [];
    public productos_devueltos: any[] = [];
    public totalOrder;
    public totalOrderIVA;
    public total = 0;
    public nProducts = 0;
    public totalTienda = 0;
    public descuento = 0;
    public orderCode = '';
    public estado = '';
    public companie = '';
    public segmento = 'devueltos';
    public roles = Roles; 

    constructor(private modal: ModalController,
                private util: UtilitiesHelper) {
    }

    ngOnInit() {
        const companie =  (this.order.productos[0]) ? ' / ' +  this.order.productos[0].compania : '';
        this.estado = this.order.estado;
        this.companie = this.order.distribuidor  + companie;
        this.products = this.order.productos;
        this.productos_devueltos = this.order.productos_devueltos;
        // this.orderCode = this.order.cod_pedido;
        this.orderCode = this.order.id;
        this.updateSellData();
    }

    updateSellData() {
        this.totalOrder = 0;
        this.totalOrderIVA = 0;
        this.total = 0;
        let nProductsTemp = 0;
        this.products.forEach((value) => {
            if (value.factor && value.factor > 0) {
                if (value.iva == 0) {
                    value.total = +value.cantidad * +value.valor;
                    this.totalOrder = this.totalOrder + (  +value.valor * (1 - parseFloat(value.descuento)) * +value.cantidad);
                    this.total = +this.total + +value.total; // + iva;
                } else {
                    value.total = +value.cantidad * +value.valor;
                    if (value.precio_unitario == value.valor) {
                        value.precio_unitario = value.valor_original;
                    }
                    this.totalOrder = this.totalOrder + (  +value.precio_unitario * (1 - parseFloat(value.descuento)) * +value.cantidad);
                    this.total = +this.total + +value.total; // + iva;
                }

            } else {
                value.total = +value.cantidad * +value.precio_unitario * (1 - parseFloat(value.descuento));
                // *  this.totalOrder = +this.totalOrder + (+value.cantidad * +value.precio_unitario) ;
                this.totalOrder += value.total; //+ (  +value.precio_unitario * (1 - parseFloat(value.descuento)) * +value.cantidad);
                let iva = value.total * +value.iva;
                this.totalOrderIVA = this.totalOrderIVA + iva;
                this.total = +this.total + +value.total + iva;
                // this.totalTienda = this.total - (value.total * parseFloat(value.descuento));
                // this.descuento = this.descuento + (value.total * parseFloat(value.descuento));
                // nProductsTemp += value.cantidad;
            }
            nProductsTemp += value.cantidad;
        });
        if (this.nProducts == 0) {
            this.nProducts = nProductsTemp;
        }
        //this.totalOrderIVA = +this.totalOrder;
        // * this.totalOrderIVA = +this.total - +this.totalOrder;
        //this.totalOrder = +this.total - +this.totalOrder;
        this.segmento = (this.products.length == 0 && this.productos_devueltos.length > 0) ? 'devueltos' : 'productos';
    }

    close() {
        this.modal.dismiss();
    }

    getFullProductName(product) {
        return this.util.getFullProductName(product);
    }

    cambiarSegmento(ev: any) {
        this.segmento = ev.detail.value;
    }

    getMesureName(mesure) {

        const m = {
            'KILO': 'kg',
            'UNID': 'und',
        };
        return m[mesure];
    }
}

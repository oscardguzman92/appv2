import {Component, OnInit} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from 'src/app/services/api/api.service';
import {UtilitiesHelper} from 'src/app/helpers/utilities/utilities.helper';
import {Subscription} from 'rxjs';
import {SetDropSizeAction, SET_DROP_SIZE, GetDropSizeAction} from 'src/app/modules/vendedor/misClientes/store/mis-clientes.actions';
import {filter} from 'rxjs/operators';
import {ActionsSubject, Store} from '@ngrx/store';
//import { AppState } from '../../../pedidos/pages/pedidos/store/companies.reducer';
import {AppState} from '../../../../../store/app.reducer';


@Component({
    selector: 'app-indicadores',
    templateUrl: './indicadores.page.html',
    styleUrls: ['./indicadores.page.scss'],
})
export class IndicadoresPage implements OnInit {

    private user: IUser;
    public paquetes;
    public promedioRecargas;
    productosMasPuntosSuman: any;
    productosMasVendidosOtrasTiendas: any;
    public dropSize: any = {
        pedido_promedio: '',
        porcentaje_cumplimiento_p_p: '',
        frecuencia_pedido: '',
        cumplimiento_frecuencia_pedido: '',
        referencia_promedio: '',
        cumplimiento_referencia_promedio: ''
    };
    private subsDropSize = new Subscription();


    constructor(private route: ActivatedRoute,
        private api: ApiService,
        private helper: UtilitiesHelper,
        private actionsS: ActionsSubject,
        private store: Store<AppState>) {

        const token = this.route.snapshot.data['user'].token;
        this.store.dispatch(new GetDropSizeAction(token, this.route.snapshot.data['user'].tiendas[0]));

        this.subsDropSize = this.actionsS
            .pipe(filter(res => res.type === SET_DROP_SIZE))
            .subscribe((res: SetDropSizeAction) => {
                this.dropSize = res.dropSize;
            });

    }

    ngOnInit() {
        this.user = this.route.snapshot.data['user'];
        let token = this.route.snapshot.data['user'].token;
        let tiendaid = this.route.snapshot.data['user'].tiendas[0].id;

        this.getPaquetes(token).subscribe((success) => {
            if (success.status == 'ok' && success.code == '0') {
                this.paquetes = success.content.productosServicios.data;
            } else {
                this.paquetes = success;
            }
        }, error => {
            console.log(error);
        });

        this.getPromedioRecargas(token).subscribe((success) => {
            if (success.status == 'ok' && success.code == '0') {
                this.promedioRecargas = success.content.promedio;
            } else {
                this.promedioRecargas = null;

            }
        }, error => {
            console.log(error);
        });

        this.getProductosMasPuntosSuman(token, tiendaid).subscribe((success) => {
            if (success.status == 'ok' && success.code == '0') {
                this.productosMasPuntosSuman = success.content.productos;
            } else {
                this.productosMasPuntosSuman = null;
            }
        }, error => {
            console.log(error);
        });
        this.getProductosMasVendidosOtrasTiendas(token, tiendaid).subscribe((success) => { //errror
            if (success.status == 'ok' && success.code == '0') {
                this.productosMasVendidosOtrasTiendas = success.content.productos.data;
            } else {
                this.productosMasVendidosOtrasTiendas = null;
            }
        }, error => {
            console.log(error);
        });
    }

    ngOnDestroy() {
        this.subsDropSize.unsubscribe();
    }

    getPaquetes(token?: string) {
        let endpoint = 'getPaquetesMasSolicitados';
        let params: any = {
            token: (token) ? token : null
        };
        return this.api.get(endpoint, params, true);
    }


    getPromedioRecargas(token?: string) {
        let endpoint = 'getPromedioVentaRecargasTiendasCercanas';
        let params: any = {
            token: (token) ? token : null
        };
        return this.api.get(endpoint, params, true);
    }

    getProductosMasPuntosSuman(token: string, tiendaId) {
        let endpoint = 'getProductosMasPuntosSuman';
        let params: any = {
            token: (token) ? token : null,
            tipo: 'tienda',
            id: tiendaId
        };
        return this.api.get(endpoint, params, true);
    }

    getProductosMasVendidosOtrasTiendas(token: string, tiendaId) {
        let endpoint = 'getProductosMasVendidosOtrasTiendas';
        let params: any = {
            token: (token) ? token : null,
            tipo: 'tienda',
            id: tiendaId
        };
        return this.api.get(endpoint, params, true);
    }

    getFulName(producto) {
        let r = this.helper.getFullProductName(producto);
        return r;
    }
}

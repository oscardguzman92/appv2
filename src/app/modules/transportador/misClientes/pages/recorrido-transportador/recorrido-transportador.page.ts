import {Component, OnInit, ViewChild} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {IWayPoint} from '../../../../../interfaces/IWayPoint';
import {ICoords} from '../../../../../interfaces/ICoords';
import {MapaTransportadorComponent} from '../../../compartido/components/mapa-transportador/mapa-transportador.component';
import {IRoute} from '../../../../../interfaces/IRoute';
import {ListaTiendasComponent} from '../../../compartido/components/lista-tiendas/lista-tiendas.component';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';

@Component({
    selector: 'app-recorrido-transportador',
    templateUrl: './recorrido-transportador.page.html',
    styleUrls: ['./recorrido-transportador.page.scss'],
})
export class RecorridoTransportadorPage implements OnInit {

    public user: IUser;
    public wayPoints: IWayPoint[] = [];
    public origin: ICoords | string;
    public editRoute: boolean;
    public enabledEdit: boolean;
    public ruta: IRoute;
    public indexSelected: number;
    public limitShowRoute: number;

    @ViewChild(MapaTransportadorComponent)
    private mapComponent: MapaTransportadorComponent;

    @ViewChild(ListaTiendasComponent)
    private listaTiendasComponent: ListaTiendasComponent;

    constructor(private route: ActivatedRoute, private navigation: NavigationHelper, private router: Router,
                private util: UtilitiesHelper) {
        this.editRoute = false;
        this.enabledEdit = false;
        this.origin = {lat: 4.6381991, lng: -74.0862351};
        this.user = this.route.snapshot.data['user'];

        if (this.router.getCurrentNavigation().extras.state) {
            this.ruta = this.router.getCurrentNavigation().extras.state.data.ruta;
            this.indexSelected = this.router.getCurrentNavigation().extras.state.data.selected;
            this.limitShowRoute = this.router.getCurrentNavigation().extras.state.data.limitShowRoute;
            this.orderRoute();
        }
    }

    ionViewWillEnter() {
    }

    ngOnInit() {
    }

    showEditRoute(value: boolean) {
        this.editRoute = value;
        if (!this.editRoute) {
            this.enabledEdit = false;
        }
    }

    editRouteTransporter(value: boolean) {
        if (!value) {
            this.enabledEdit = value;
            return;
        }
        this.util.alertOrderOnlyAcceptHandle(
            '¿Deseas editar el orden de la ruta? Recuerda que esta es la ruta optima para tu trayecto, ' +
            'si la modificas puedes tener retrasos de tiempo',
            () => {
                this.enabledEdit = value;
            }
        );
    }

    changeWayPoints(change) {
        this.mapComponent.reloadMap(this.wayPoints, change);
    }

    reOrderRoute(pedidos) {
        this.wayPoints = [];
        this.orderRoute(pedidos);
    }

    private orderRoute(pedidos?) {
        const pedidosOrder = (pedidos) ? pedidos : this.ruta.pedidos;
        for (const pedido of pedidosOrder) {
            if (pedido.entregado) {
                continue;
            }
            let lat = null, long = null; const coords: ICoords = {lat: null, lng: null};
            if ((pedido.pedido && pedido.pedido.tienda) && (pedido.pedido.tienda.latitud && pedido.pedido.tienda.latitud !== '-1')) {
                lat = pedido.pedido.tienda.latitud;
            }

            if ((pedido.pedido && pedido.pedido.tienda) && (pedido.pedido.tienda.latitud && pedido.pedido.tienda.longitud !== '-1')) {
                long = pedido.pedido.tienda.longitud;
            }

            if (lat != null && long != null) {
                coords.lat = parseFloat(lat);
                coords.lng = parseFloat(long);
            }

            this.wayPoints.push({
                shopName: (pedido.pedido && pedido.pedido.tienda) && pedido.pedido.tienda.nombre,
                address: (pedido.pedido && pedido.pedido.tienda) && pedido.pedido.tienda.direccion +
                    ',' + (pedido.pedido.tienda.ciu_nombre && pedido.pedido.tienda.ciu_nombre),
                location: (coords.lat && coords.lng) ? coords : (pedido.pedido && pedido.pedido.tienda)
                    && (pedido.pedido.tienda.direccion + ',' + (pedido.pedido.tienda.ciu_nombre && pedido.pedido.tienda.ciu_nombre)),
                stopover: true,
                orden: pedido.orden
            });
        }
    }

    changeOrder(newOrder: number[]) {
        this.listaTiendasComponent.changeOrder(newOrder);
    }
}

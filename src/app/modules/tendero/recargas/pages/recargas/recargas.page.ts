import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppState} from '../../store/topUps/topUps.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {GET_TOP_UPS, GetTopUpsAction, SET_TOP_UPS, SET_TOP_UPS_SELECTED, SetTopUpsAction} from '../../store/topUps/topUps.actions';
import {Subscription} from 'rxjs';
import {IProductService} from '../../../../../interfaces/IProductService';
import {filter, finalize, map, tap} from 'rxjs/operators';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {Actions, ofType} from '@ngrx/effects';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../../../../../interfaces/IUser';
import {RecargasSolicitarSaldosComponent} from '../components/recargas-solicitar-saldos/recargas-solicitar-saldos.component';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';

@Component({
    selector: 'app-recargas',
    templateUrl: './recargas.page.html',
    styleUrls: ['./recargas.page.scss'],
})
export class RecargasPage implements OnInit {
    @ViewChild(RecargasSolicitarSaldosComponent) balanceComponent: RecargasSolicitarSaldosComponent;

    operators: IProductService[];
    packages: IProductService[];
    initPackages: IProductService[];
    segmento = '';

    private getTopsUpsSubs = new Subscription();
    public user: IUser;
    public compareFn = (a, b) => {
        if (a.orden < b.orden) {
            return -1;
        }
        if (a.orden > b.orden) {
            return 1;
        }
        return 0;
    };
    constructor(
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private route: ActivatedRoute,
        private navigation: NavigationHelper) {
        this.segmento = 'operadores';
    }


    ngOnInit() {
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetTopUpsAction(this.user.token));
        this.getTopsUps();
    }

    cambiarSegmento(ev: any) {
        this.segmento = ev.detail.value;
    }

    ionViewWillLeave() {
        this.getTopsUpsSubs.unsubscribe();
        this.balanceComponent.unsubscribe();
    }

    private getTopsUps() {
        this.getTopsUpsSubs = this.actionsSubj
            .pipe(filter((res: SetTopUpsAction) => res.type === SET_TOP_UPS))
            .pipe(filter((res: SetTopUpsAction) => res.topUps !== null))
            .pipe(map((res: SetTopUpsAction) => res.topUps))
            .pipe(map((productsServices: IProductService[]) => {
                return {
                    operators: productsServices.filter(productService => productService.tipo_producto === 'recargas'),
                    packages: productsServices.filter(productService => productService.tipo_producto === 'paquetes')
                };
            }))
            .pipe(map((productService: { operators: IProductService[], packages: IProductService[] }) => {
                productService.packages.sort(this.compareFn);
                productService.operators.sort(this.compareFn);
                return productService;
            }))
            .subscribe((productService: { operators: IProductService[], packages: IProductService[] }) => {
                this.packages = productService.packages;
                this.initPackages = productService.packages;
                this.operators = productService.operators;
                this.store.dispatch(new LoadingOff());
            });
    }



    showRecord() {
        this.store.dispatch(new LoadingOn());
        this.navigation.goToBack('historial-recargas');
    }

    search(searchString) {
        if (!searchString) {
            this.packages = [ ...this.initPackages ];
            return;
        }

        this.packages = this.initPackages.filter(packageItem => {
            if (!isNaN(searchString)){
                return (packageItem.monto_maximo.toString().indexOf(searchString.toString()) !== -1 ||
                    packageItem.monto_minimo.toString().indexOf(searchString.toString()) !== -1);
            }
            return (
                packageItem.nombre.toLowerCase().includes(searchString.toLowerCase()) ||
                packageItem.observacion.toLowerCase().includes(searchString.toLowerCase())
            );
        });
    }
}

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalOptions} from '@ionic/core';
import {ModalController} from '@ionic/angular';
import {RecargasValidarContrasenaComponent} from '../recargas/components/recargas-validar-contrasena/recargas-validar-contrasena.component';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {AppState} from '../../store/topUps/topUps.reducer';
import {Store} from '@ngrx/store';
import {SetTopUpsSelectedAction} from '../../store/topUps/topUps.actions';
import {Subscription} from 'rxjs';
import {IUser} from '../../../../../interfaces/IUser';
import {IProductService} from '../../../../../interfaces/IProductService';
import {filter} from 'rxjs/operators';
import {CacheService} from 'ionic-cache';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {GetCurrentAccountAction} from '../../store/currentAccount/currentAccount.actions';
import {RecargasCrearContrasenaComponent} from '../recargas/components/recargas-crear-contrasena/recargas-crear-contrasena.component';
import {ActivatedRoute} from '@angular/router';
import {RecargasSolicitarSaldosComponent} from '../components/recargas-solicitar-saldos/recargas-solicitar-saldos.component';

@Component({
    selector: 'app-realizar-recarga',
    templateUrl: './realizar-recarga.page.html',
    styleUrls: ['./realizar-recarga.page.scss'],
})
export class RealizarRecargaPage implements OnInit {
    @ViewChild(RecargasSolicitarSaldosComponent) balanceComponent: RecargasSolicitarSaldosComponent;

    private dismiss: boolean;
    private selectedTopsUpsSubs = new Subscription();
    private currentAccountSubscribe = new Subscription();
    public user: IUser;

    public topUpsSelected: IProductService;
    public show: boolean;
    public showFooter: boolean;

    constructor(
        public modalController: ModalController,
        private storage: Storage,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private cache: CacheService,
        private route: ActivatedRoute) {
        this.dismiss = true;
        this.user = this.route.snapshot.data['user'];
        this.showFooter = true;
    }

    ngOnInit() {
    }

    ionViewWillEnter () {
        this.initSubs();
    }

    async ionViewWillLeave() {
        this.balanceComponent.unsubscribe();
        this.selectedTopsUpsSubs.unsubscribe();
        this.currentAccountSubscribe.unsubscribe();

        if (!this.dismiss) {
            this.modalController.dismiss();
        }
        await this.storage.remove('topUpsselected');
    }

    private initSubs() {

        this.validatePass();

        this.selectedTopsUpsSubs = this.store.select('topUps')
            .pipe(filter(res => res.topUpsSelected !== null))
            .subscribe(res => {
                this.topUpsSelected = res.topUpsSelected;
            });

        this.currentAccountSubscribe = this.store.select('currentAccount')
            .pipe(filter(res => res.currentAccount !== null))
            .subscribe(res => {
                this.show = true;
            });
    }

    private validatePass() {
        this.storage.get('topUpsselected')
            .then((topUpsSelected) => {
                if (!topUpsSelected) {
                    this.navigation.goTo(this.user.rootPage);
                    return;
                }
                this.store.dispatch(new SetTopUpsSelectedAction([], JSON.parse(topUpsSelected)));
                return this.cache.getItem('pass_act');
            })
            .then((pass) => {
                if (pass) {
                    this.store.dispatch(new LoadingOn());
                    this.store.dispatch(new GetCurrentAccountAction(this.user.token, pass));
                }
            });
    }

    public footerShow(show): void  {
        this.showFooter = show;
    }
}

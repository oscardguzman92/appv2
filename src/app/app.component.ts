import {Component, QueryList, ViewChildren} from '@angular/core';

import {IonRouterOutlet, LoadingController, MenuController, Platform, ToastController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Storage} from '@ionic/storage';
import {NavigationHelper} from './helpers/navigation/navigation.helper';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from './store/app.reducer';
import {AuthService} from './services/auth/auth.service';
import {NoticationService} from './services/pushNotification/notication.service';
import {MobileAccessibility} from '@ionic-native/mobile-accessibility/ngx';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {AnalyticsService} from './services/analytics/analytics.service';

import {OfflineService} from './services/offline/offline.service';
import * as formOfflineActions from 'src/app/modules/vendedor/compartido/components/compartido-menu-vendedor/store/actions/offline.actions';
import {OfflineState} from 'src/app/modules/vendedor/compartido/components/compartido-menu-vendedor/store/reducers/offline.reducer';

import {Router} from '@angular/router';
import {VibrateService} from 'src/app/services/vibrate/vibrate.service';
import {BackButtonAction} from './modules/tendero/registro/store/registro.actions';
import {OneSignalService} from './services/oneSignal/one-signal.service';
import {Intercom} from '@ionic-native/intercom/ngx';
import {Device} from '@ionic-native/device/ngx';
import {IntercomService} from './services/intercom/intercom.service';
import {Network} from '@ionic-native/network/ngx';
import {of, Subscription} from 'rxjs';
import {SetOfflineDynamicAction} from './modules/vendedor/compartido/store/offlineDynamic/offlineDynamic.actions';
import {CacheService} from 'ionic-cache';
import {Roles} from './enums/roles.enum';
import { UserBuilder } from './builders/user.builder';
import { LocalNotification, LocalNotificationService } from './services/localNotification/local-notification.service';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import {ComunidadTenderosPage} from './modules/compartido/comunidadTenderos/pages/comunidad-tenderos/comunidad-tenderos.page';
import {routesDeeplinks} from './helpers/deeplinkins/deeplink.helper';
import {IDeeplink} from './interfaces/IDeeplink';
import { SuperSellerService } from './services/users/super-seller.service';
import {BranchIo} from '@ionic-native/branch-io';
import {Seller} from './models/Seller';
import {ApiService} from 'src/app/services/api/api.service';
import { HttpParams } from '@angular/common/http';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { LoadingOff } from './modules/compartido/general/store/actions/loading.actions';
import { Fail } from './modules/compartido/general/store/actions/error.actions';
import { GetValidarProductsAction, SetValidarProductsAction, SET_VALIDA_PRODUCTS } from './modules/compartido/deeplink/deeplink.action';
import { Effect,Actions, ofType } from '@ngrx/effects';
import { GeneralObsService } from './services/observables/general-obs.service';

declare var cordova: any;


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {

    lastTimeBackPress = 0;
    timePeriodToExit = 2000;
    @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
    public actionsValidateProducts = new Subscription();
    dataLink:any = {"+clicked_branch_link":true,"$deeplink_path":"producto","product_id":"39562"};

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private apiService: ApiService,
        private statusBar: StatusBar,
        private menu: MenuController,
        private localnotification: LocalNotificationService,
        private storage: Storage,
        private navigation: NavigationHelper,
        private store: Store<AppState>,
        private storages: Store<OfflineState>,
        private auth: AuthService,
        private superSellerService: SuperSellerService,
        private notiService: NoticationService,
        private mobileAccessibility: MobileAccessibility,
        private screenOrientation: ScreenOrientation,
        private analyticsService: AnalyticsService,
        private offlineservice: OfflineService,
        private router: Router,
        private toast: ToastController,
        private vibrateService: VibrateService,
        private loadingC: LoadingController,
        private oneSignal: OneSignalService,
        private intercom: Intercom,
        private intercomService: IntercomService,
        private device: Device,
        private network: Network,
        private cache: CacheService,
        private actionS: ActionsSubject,
        private actions$: Actions,
        public generalObsService: GeneralObsService,
        private deeplinks: Deeplinks) {
        this.initializeApp();
    }

    ngOnDestroy() {
        this.actionsValidateProducts.unsubscribe();
    }

    async initializeApp() {
        this.storage.remove('deeplink');
        this.platform.ready().then(async () => {
            this.statusBar.styleDefault();
            this.statusBar.backgroundColorByHexString('#ffffff');
            this.splashScreen.hide();
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            this.verifyFont();
            this.verifyAuth();
            this.oneSignal.getId();
            // upload sound
            this.vibrateService.uploadSound();
            
            // init push notification service
            this.notiService.initConfig();

            // init analytics
            this.analyticsService.initAnalytics();

            this.localnotification.initHandler();

            // init notifications intercom
            this.notificationsIntercom();

            // offline
            this.offlineservice.isOfflineActive(async cb => {
                if (cb) {
                    const action = new formOfflineActions.ToggleOfflineAction(true);
                    this.storages.dispatch(action);
                } else {
                    const withoutConnection = await this.storage.get('withoutConnection');
                    if (withoutConnection) {
                        const action = new formOfflineActions.ToggleOfflineAction(true);
                        this.storages.dispatch(action);
                    }
                }
            });
            
            // Deeplinks
            this.initDeeplinking();
            /* const user = await this.auth.isAuth();
            if (user === false) {
                return of(false);
            }
            this.store.dispatch(new GetValidarProductsAction(user["user"]["token"], "34408", user["user"]["tiendas"][0]["id"])); */
            
            this.setValidarProductos();


            this.backButtonEvent();

            this.network.onDisconnect().subscribe(async () => {
                const user = await this.auth.isAuth();

                if (user === false) {
                    return of(false);
                }
                const userFinal = user.getUser();

                if (!userFinal) {
                    return of(false);
                }
                if (userFinal.role !== Roles.seller) {
                    return of(false);
                }

                if ((userFinal as Seller).sin_archivos_offline) {
                    return of(false);
                }
                this.cache.saveItem('offlineDynamic', true, 'offlineDynamic', 600);
                this.store.dispatch(new SetOfflineDynamicAction(true));
            });

            this.platform.resume.subscribe((e) => {
                this.initDeeplinking();
            });
            
      

        });
    }

    private verifyRegister() {
        this.storage.get('auth-register').then(res => {
            if (!res) {
                this.navigation.goTo('inicio');
                this.intercomService.registerUnidentifiedUserApp();
                return;
            }

            this.navigation.goTo('registro');
        });
    }

    private verifyAuth() {
        let register = false;
        this.storage.get('auth-register')
            .then(res => {
                if (res) {
                    register = true;
                }
                 return this.auth.isAuth();
            }).then(async user => {
                if (register) {
                     this.verifyRegister();
                    return;
                }

                if (user !== false) {
                    let userSuperSellerTemp = await this.storage.get('userSuperSellerTemp');
                    if (userSuperSellerTemp) {
                        userSuperSellerTemp = JSON.parse(userSuperSellerTemp);
                        this.superSellerService.idSuperSeller = userSuperSellerTemp.super_vendedor_id;
                        user = new UserBuilder(userSuperSellerTemp);
                    }
                    this.intercomService.registerUser(user.getUser());
                    this.navigation.goTo(user.getUser().rootPage);
                    return;
                }

                 this.verifyRegister();
            }, err => {
                this.navigation.goTo('inicio');
            });
    }

    private verifyFont() {
        if (this.mobileAccessibility) {
            this.mobileAccessibility.usePreferredTextZoom(false);
        }
    }

    backButtonEvent() {
        this.platform.backButton.subscribeWithPriority(0, async () => {
            const loading = await this.loadingC.getTop();

            this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
                if (outlet && outlet.canGoBack()) {
                    if (!loading) {
                        outlet.pop();
                    }
                    // tslint:disable-next-line:max-line-length
                } else if (this.router.url === '/inicio-tendero' || this.router.url === '/lista-clientes' || this.router.url === '/inicio') {
                    if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
                        navigator['app'].exitApp();
                    } else {
                        this.presentToast();
                    }
                } else if (this.router.url === '/registro') {
                    this.store.dispatch(new BackButtonAction());
                }
            });
        });
    }

    async presentToast() {
        const toast = await this.toast.create({
            message: 'Oprima nuevamente para cerrar la aplicación.',
            duration: 2000
        });
        toast.present();
        this.lastTimeBackPress = new Date().getTime();

    }

    private notificationsIntercom() {
        if (this.device.platform === 'iOS') {
            try {
                this.intercom.registerForPush();
            } catch (e) {
                console.log('Error de notificaciones push');
            }
        }
    }

    private async initDeeplinking() {
        this.storage.remove('deeplink');
        const user = await this.auth.isAuth();

        if (!user || user['user'].role !== Roles.shopkeeper) return;

        BranchIo.initSession()
            .then(dataLink => {
                
                if (!dataLink['+clicked_branch_link']) {
                    return;
                }

                if (!dataLink['$deeplink_path']) {
                    return;
                }
                this.dataLink = dataLink;
                this.store.dispatch(new GetValidarProductsAction(user["user"]["token"], dataLink['product_id'], user["user"]["tiendas"][0]["id"]));
                /* const path = dataLink['$deeplink_path'];
                for (const pathRegister of Object.keys(routesDeeplinks)) {
                    if ('/' +  path === pathRegister) {
                        match = true;
                        const helper: IDeeplink = new (routesDeeplinks[pathRegister].route.constructor)();
                        helper.navigate(this.navigation, user.getUser(), this.store, this.actionS, dataLink['$deeplink_path'],this.storage, this.formatDeepLLinkExtras(dataLink));
                        break;
                    }
                }

                if (!match) {
                    this.navigation.goToBack(path);
                } */

            })
            .catch(err => {
                console.error('Got a deeplink that didn\'t match', err);
            });
        return;
    }

    formatDeepLLinkExtras(data){
        const extraData:[] = [];
        if( data['v'] ){
            extraData['v'] = data['v'];
        }
        if( data['w'] ){
            extraData['w'] = data['w'];
        }
        if( data['x'] ){
            extraData['x'] = data['x'];
        }
        if( data['y'] ){
            extraData['y'] = data['y'];
        }
        if( data['z'] ){
            extraData['z'] = data['z'];
        }
        return extraData;                          
    }

    setValidarProductos(){
        this.actionsValidateProducts = this.actionS.pipe(filter((res: SetValidarProductsAction) => res.type === SET_VALIDA_PRODUCTS))
        .subscribe(async (res) => {
            const user = await this.auth.isAuth();
            if (!user  || !res || !res.product) return;
            let match = false;
            
            const path = this.dataLink['$deeplink_path'];
            for (const pathRegister of Object.keys(routesDeeplinks)) {
                if ('/' +  path === pathRegister) {
                    match = true;
                    let dataFromProduct = this.getDataFromProduct(res.product);
                    const helper: IDeeplink = new (routesDeeplinks[pathRegister].route.constructor)();
                    helper.navigate(this.navigation, user.getUser(), this.store, this.actionS, this.dataLink['$deeplink_path'],this.storage, this.formatDeepLLinkExtras(dataFromProduct), this.generalObsService);
                    break;
                }
            }

            if (!match) {
                this.navigation.goToBack(path);
            }
        });
    }

    getDataFromProduct(product){
        return {"v":"c","w":product["producto_id"],"x":product["compania_id"]};
        //return {"v":"p","w":product["producto_id"],"x":product["prod_vendedores"][0],"y":product["distribuidor_id"],"z":product["prod_categorias"][0]["id"]}
    }

}

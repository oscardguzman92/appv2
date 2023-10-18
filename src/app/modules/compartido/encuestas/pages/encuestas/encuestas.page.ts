import { MsgErrorService } from './../../../../../services/api/msg-error.service';
import { UserSurveysService } from './../../../../../services/users/user-surveys.service';
import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../../../../../interfaces/IUser';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {GetSurveysAction, SET_SURVEYS, SetSurveysAction,GetSurveysFannyResponseAction, SetSurveysFannyResponseAction, SET_SURVEYS_FANNY_RESPONSE} from '../../store/encuestas.actions';
import {LoadingOff, LoadingOn} from '../../../general/store/actions/loading.actions';
import {filter, map} from 'rxjs/operators';
import {ISurveys} from '../../../../../interfaces/ISurveys';
import {Set_Survey, SetSurveyAction, SetSurveysAction as SetSurveysDataAction} from '../../../comunidadTenderos/pages/store/comunidad-tenderos.actions';
import {CacheService} from 'ionic-cache';
import {Success} from '../../../general/store/actions/sucess.actions';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Shop } from 'src/app/models/Shop';
import { SetOfflineDynamicAction } from 'src/app/modules/vendedor/compartido/store/offlineDynamic/offlineDynamic.actions';

@Component({
    selector: 'app-encuestas',
    templateUrl: './encuestas.page.html',
    styleUrls: ['./encuestas.page.scss'],
})
export class EncuestasPage implements OnInit {
    private surveysObs = new Subscription();
    private actionsSetSurvey = new Subscription();
    public user: IUser;
    public encuestaFanny: boolean = false;
    public encuestasRespondidas: ISurveys[];
    public encuestasNoRespondidas: ISurveys[];
    public shop_id: number;
    public shop: Shop;
    public detalle_cliente: boolean = false;
    public codigo_cliente: number;
    public btn_easyfiel: boolean = false;
    public encuestasFannyRespondidas: Array<any> = [];
    public offlineDynamic: boolean;
    public offlineDynamic2: boolean;
    private offlineSubs = new Subscription();

    constructor(private route: ActivatedRoute,
                private router: Router,
                private store: Store<AppState>,
                private actionsObj: ActionsSubject,
                private cache: CacheService,
                private navigation: NavigationHelper,
                private analyticsService: AnalyticsService,
                private appLauncher: AppLauncher,
                private platform: Platform,
                private alertController: AlertController,
                private apiService: ApiService,
                public userSurveysService: UserSurveysService,
                private msgErrorService: MsgErrorService,
    ) {
        this.user = this.route.snapshot.data['user'];
        if (this.router.getCurrentNavigation().extras.state) {
            const data = this.router.getCurrentNavigation().extras.state.data;
            if (data.shop_id) {
                this.shop_id = data.shop_id;
            }
            if (data.shop) {
                this.shop = data.shop;
            }
            if(data.detalle_cliente){
                this.detalle_cliente = data.detalle_cliente;
            }
            if(data.codigo_cliente){
                this.codigo_cliente = data.codigo_cliente;
            }
            if (data.encuestaFanny) {
                this.encuestaFanny = true;
            }
        }
    }
    

    ionViewWillEnter() {
        this.pendingSurvey();
    }

    pendingSurvey() {
        
        this.userSurveysService.getSurveysPendStorage().then(() => {
            this.encuestasRespondidas = this.encuestasRespondidas || [];
            this.encuestasNoRespondidas = this.encuestasNoRespondidas || [];
            this.btn_easyfiel = this.btn_easyfiel;
            if(this.encuestasFannyRespondidas)
                this.encuestasFannyRespondidas = this.encuestasFannyRespondidas || [];
        });
    }

    async ngOnInit() {
        this.offlineDynamic2 = false;
        await this.cache.getItem('offlineDynamic')
        .then((res) => {
            this.offlineDynamic2 = true;
        }).catch(() => {
            this.offlineDynamic2 = false;
        });
        
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.offlineDynamic = success.active;
            if (this.offlineDynamic || this.offlineDynamic2) {
                this.userSurveysService.getSurveyStorageList()
                    .then((res: any) => {
                    if (res) {
                        this.encuestasRespondidas = this.filterStoragePendientes(res.encuestas_respondidas || []);
                        let tempEncuestasNoRespondidas
                        if (this.detalle_cliente == true){
                             tempEncuestasNoRespondidas = [...(res.encuestas_no_respondidas || []),...(res.encuestas_visual_tendero || [])];
                        }else{
                             tempEncuestasNoRespondidas = res.encuestas_no_respondidas;
                        }
                        
                        this.encuestasNoRespondidas = this.filterStoragePendientes(tempEncuestasNoRespondidas || []);
                        
                        this.btn_easyfiel = res.btn_easyfiel;
                        if(res.encuestas_fanny_respondidas)
                            this.encuestasFannyRespondidas = this.filterStoragePendientes(res.encuestas_fanny_respondidas || []);
                        /* this.store.dispatch(new LoadingOn(true));
                        this.store.dispatch(new GetSurveysFannyResponseAction(this.user.token)); */
                    } else {
                        this.store.dispatch(new LoadingOn(true));
                        this.store.dispatch(new GetSurveysAction(this.user.token, this.shop_id,  this.encuestaFanny,this.detalle_cliente,this.codigo_cliente));
                    }
                })
            } else {
                this.store.dispatch(new LoadingOn(true));
                this.store.dispatch(new GetSurveysAction(this.user.token, this.shop_id,  this.encuestaFanny,this.detalle_cliente, this.codigo_cliente));
            }

        });
        this.surveysObs = this.actionsObj
            .pipe(filter((res: SetSurveysAction) => res.type === SET_SURVEYS))
            .subscribe(res => {
                this.encuestasRespondidas = res.encuestas_respondidas || [];
                this.encuestasNoRespondidas = res.encuestas_no_respondidas || [];
                this.btn_easyfiel = res.btn_easyfiel;
                if(res.encuestas_fanny_respondidas)
                    this.encuestasFannyRespondidas = res.encuestas_fanny_respondidas || [];
                this.store.dispatch(new LoadingOff());
            });
        
        this.surveysObs = this.actionsObj
            .pipe(filter((res: SetSurveysFannyResponseAction) => res.type === SET_SURVEYS_FANNY_RESPONSE))
            .subscribe(res => {
                this.encuestasFannyRespondidas = res.encuestas_fanny_respondidas;
                this.store.dispatch(new LoadingOff());
            });
        
        this.actionsSetSurvey = this.actionsObj
            .pipe(filter((res: SetSurveyAction) => res.type === Set_Survey))
            .subscribe((res) => {
                this.store.dispatch(new Success({message: 'La encuesta se respondió correctamente'}));
                this.navigation.goTo(this.user.rootPage);
            });
    }

    setSurveysStorage() {
        setTimeout(() => {
            this.pendingSurvey();
        }, 500);
    }

    filterStoragePendientes(encuestasNoRespondidas) {
        let result:any;
        if (this.detalle_cliente == true){
            result = encuestasNoRespondidas.filter(encuestasNoRespondida => {
                let temp = JSON.parse(encuestasNoRespondida.parametros);
                //let temp = {"cliente_id":"37195,4103"};
                return (typeof temp.cliente_id === 'undefined' || 
                temp.cliente_id.split(",").includes(String(this.codigo_cliente)))
            });
        }else{
            result = encuestasNoRespondidas;
        }
        
        return result;
        /* let pendientes = [];
        if (this.userSurveysService.surveysStorage.length == 0 || !encuestasNoRespondidas) return encuestasNoRespondidas;
        this.userSurveysService.surveysStorage.forEach(e => {
            pendientes.push(e.survey_id);
        });
        let res = encuestasNoRespondidas.filter(e => !pendientes.includes(e.id))
        return res; */
    }
    
    public goToEasyfiel() {
        this.analyticsService.sendEvent("click", {'event_category': "concursos", 'event_label': "easy_fiel"});
        const options: AppLauncherOptions = {
        }
        if(this.platform.is('ios')) {
            options.uri = 'fb://'
        } else {
            options.packageName = 'com.amdp.easyfiel'
        }
    
        this.appLauncher.canLaunch(options)
            .then((canLaunch: boolean) => {
                if (canLaunch) {
                    this.appLauncher.launch(options)
                        .catch((error: any) => {
                            window.open('https://play.google.com/store/apps/details?id=com.amdp.easyfiel&hl=en ', '_blank');
                        });
                } else {
                    window.open('https://play.google.com/store/apps/details?id=com.amdp.easyfiel&hl=en ', '_blank');
                }
            })
            .catch((error: any) => {
                window.open('https://play.google.com/store/apps/details?id=com.amdp.easyfiel&hl=en ', '_blank');
            });
    }

    async enviarEncuestasStorage() {
        let encuestasStorage = await this.userSurveysService.getSurveyStorageList();
        this.store.dispatch(new LoadingOn(true));
        this.enviarEncuestasPend(encuestasStorage)
    }

    enviarEncuestasPend(encuestasStorage) {
        if (this.userSurveysService.surveysStorage.length == 0) {
            this.store.dispatch(new LoadingOff());
            this.userSurveysService.setSurveyStorageList(encuestasStorage);
            this.presentAlert("Se enviaron correctamente las encuestas pendientes");
            return;
        }
        let action  = this.userSurveysService.surveysStorage[0];
        if (typeof action.data["respuestas"] =='object'){
            let dataendeada = JSON.stringify(action.data["respuestas"]);
            action.data["respuestas"] = dataendeada;
        }
        this.apiService.post2(this.apiService.getEndpoint()+'setEncuesta?token='+this.user.token, action.data, true)
            .subscribe(success => {
                this.userSurveysService.surveysStorage.splice(0, 1);
                this.userSurveysService.updateSurveysStorage(this.userSurveysService.surveysStorage);
                /* let ind = this.encuestasNoRespondidas.findIndex(e => e.id == success.survey_id)
                this.encuestasNoRespondidas.splice(ind, 1);
                encuestasStorage.encuestas_no_respondidas = Object.assign([], this.encuestasNoRespondidas); */
                //if (!this.encuestasRespondidas) this.encuestasRespondidas = [];
                //this.encuestasRespondidas.unshift(action.data);
                //encuestasStorage.encuestas_respondidas = Object.assign([], this.encuestasRespondidas);
                this.enviarEncuestasPend(encuestasStorage);
            }, async error => {
                this.store.dispatch(new LoadingOff());
                let msg = await this.msgErrorService.getErrorIntermitencia();
                this.presentAlert(msg)
            });
    }

    async presentAlert(message:string) {
        const alert = await this.alertController.create({
          header: 'Información',
          subHeader: '',
          message: message,
          buttons: ['Aceptar']
        });
    
        await alert.present();
    }

    ionViewWillLeave() {
        this.surveysObs.unsubscribe();
        this.actionsSetSurvey.unsubscribe();
    }

    ngOnDestroy() {
        this.offlineSubs.unsubscribe();
    }
}

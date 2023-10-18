import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {Subscription} from 'rxjs';
import {ISurveys} from 'src/app/interfaces/ISurveys';
import {
    LoadingOn,
    LoadingOff
} from 'src/app/modules/compartido/general/store/actions/loading.actions';
import {filter} from 'rxjs/operators';
import {
    Set_Surveys,
    SetSurveyAction,
    Set_Survey,
    GetSurveysAction,
    SetSurveysAction
} from 'src/app/modules/compartido/comunidadTenderos/pages/store/comunidad-tenderos.actions';
import {AlertController} from '@ionic/angular';
import {Mercaderista} from '../../../../../models/Mercaderista';
import {Storage} from '@ionic/storage';

@Component({
    selector: 'app-detalle-cliente-mercaderista',
    templateUrl: './detalle-cliente-mercaderista.page.html',
    styleUrls: ['./detalle-cliente-mercaderista.page.scss']
})
export class DetalleClienteMercaderistaPage implements OnInit {
    public user: Mercaderista;
    public shop: any;
    private surveySubscribe = new Subscription();
    private actionsSetSurvey = new Subscription();
    public listSurveys: ISurveys[] = [];

    constructor(
        private route: ActivatedRoute,
        private navigation: NavigationHelper,
        private actionsSubj: ActionsSubject,
        private actionsObj: ActionsSubject,
        private alertController: AlertController,
        private store: Store<AppState>,
        private router: Router,
        private storage: Storage
    ) {
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.shop = this.router.getCurrentNavigation().extras.state.data;
            } else {
                return false;
            }
        });

        this.user = this.route.snapshot.data['user'];
    }

    ngOnInit() {
        /* this.store.dispatch(new LoadingOn());
        this.store.dispatch(
            new GetSurveysAction(this.user.token, this.shop.id, '', '1')
        );
        this.surveySubscribe = this.actionsObj
            .pipe(filter((res: SetSurveysAction) => res.type === Set_Surveys))
            .subscribe(res => {
                // Encuestas
                if (res.survey.data && res.survey.data.length > 0) {
                    this.listSurveys = res.survey.data;
                }
                this.store.dispatch(new LoadingOff());
            }, err => {
                console.log(err);
            });

        this.actionsSetSurvey = this.actionsObj
            .pipe(filter((res: SetSurveyAction) => res.type === Set_Survey))
            .subscribe(res => {
                this.user.clientes_atendidos_hoy++;
                this.storage.set('user', JSON.stringify(this.user))
                    .then(res => {
                        this.store.dispatch(new LoadingOff());
                        const index = this.listSurveys.findIndex(
                            encuesta => encuesta.id === res.encuesta_id
                        );
                        this.listSurveys.splice(index, 1);
                        if (this.listSurveys.length == 0) {
                            this.navigation.justBack();
                        }
                        this.presentAlert('La encuesta se respondió correctamente');
                    });
            }); */
    }

    setBalance() {
        this.navigation.goToBack('asignar-saldo', this.shop);
    }

    async presentAlert(message: string) {
        const alert = await this.alertController.create({
            header: 'Información',
            subHeader: '',
            message: message,
            buttons: ['Aceptar']
        });

        await alert.present();
    }

    goRecord() {
        this.navigation.goToBack('mis-pedidos', {shop: this.shop});
    }

    goSurveys() {
        this.navigation.goToBack('encuestas', {
            shop: this.shop
        });
    }

    justBack() {
        this.navigation.justBack();
    }

    ngOnDestroy(): void {
        this.surveySubscribe.unsubscribe();
        this.actionsSetSurvey.unsubscribe();
    }
}

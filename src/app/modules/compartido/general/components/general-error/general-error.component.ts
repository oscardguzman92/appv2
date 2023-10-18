import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {AlertController, LoadingController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {LoadingOff, LoadingOn} from '../../store/actions/loading.actions';
import {Config} from '../../../../../enums/config.enum';
import {Market} from '@ionic-native/market/ngx';
import { ApiService } from 'src/app/services/api/api.service';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

@Component({
    selector: 'app-general-error',
    templateUrl: './general-error.component.html',
    styleUrls: ['./general-error.component.scss'],
})
export class GeneralErrorComponent implements OnInit {

    constructor(
        private store: Store<AppState>,
        private alertController: AlertController,
        private market: Market,
        private msgErrorService: MsgErrorService,
        private loadingController: LoadingController) {
    }

    ngOnInit() {
        this.store.select('error')
            .pipe(filter(error => error.error !== null))
            .subscribe(async res => {
                let error = await this.msgErrorService.getErrorIntermitencia();
                console.log(res);
                if (res.error.content) {
                    if (res.error.content.message) {
                        error = res.error.content.message;
                    } else if (res.error.content.mensaje) {
                        error = res.error.content.mensaje;
                    } else {
                        error = res.error.content;
                    }
                } else if (res.error.mensaje) {
                    error = res.error.mensaje;
                } else if (res.error.version) {
                    this.triggerErrorVersion();
                    this.store.dispatch(new LoadingOff());
                    return;
                }

                this.triggerError(error);
                this.loadingController.getTop().then(loading => {
                    if (!loading && !res.error.withoutLoading) {
                        this.store.dispatch(new LoadingOn());
                    }
                });
            });
    }

    private async triggerError(err) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: err,
            buttons: ['Aceptar'],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }

    private async triggerErrorVersion() {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: 'La versión actual de tu aplicación (' + Config.version_app_android_string + ') está desactualizada.',
            buttons: [{
                text: 'Actualizar',
                handler: () => {
                    this.market.open('com.mukuralab.storeapp');
                }
            }, {
                text: 'Aceptar'
            }],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }
}

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {AlertController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {LoadingOff} from '../../store/actions/loading.actions';

@Component({
    selector: 'app-general-success',
    templateUrl: './general-success.component.html',
    styleUrls: ['./general-success.component.scss'],
})
export class GeneralSuccessComponent implements OnInit {

    constructor(private store: Store<AppState>, private alertController: AlertController) {
    }

    ngOnInit() {
        this.store.select('success')
            .pipe(
                filter(success => success.payload != null)
            ).subscribe(res => {
                this.triggerSuccess(res.payload);
                this.store.dispatch(new LoadingOff());
            });
    }

    private async triggerSuccess(res) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: res.message,
            buttons: ['Aceptar'],
            cssClass: 'info-alert',
        });

        await alert.present();
    }

}

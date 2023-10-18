import { AlertController } from '@ionic/angular';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {IUser} from 'src/app/interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {GetMyCreditsAction, SET_MY_CREDITS, SetMyCreditsAction} from '../store/credits.actions';
import {filter} from 'rxjs/operators';
import {SetBalanceAction} from '../../../recargas/store/currentAccount/currentAccount.actions';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {ICredit} from '../../../../../interfaces/ICredit';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-lista-creditos',
    templateUrl: './lista-creditos.page.html',
    styleUrls: ['./lista-creditos.page.scss'],
})
export class ListaCreditosPage implements OnInit, OnDestroy {
    public user: IUser;
    public credits: ICredit[];

    private creditsSubs = new Subscription();

    constructor(
                private route: ActivatedRoute,
                private navigation: NavigationHelper,
                private actionSub: ActionsSubject,
                private store: Store<AppState>,
                private alertController: AlertController,
    ) {
        this.user = this.route.snapshot.data['user'];
    }

    ngOnInit(): void {

        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetMyCreditsAction(this.user.token, this.user.tiendas[0]));
        this.getCredits();
    }

    goCreditHist(credit: ICredit) {
        this.navigation.goToBack('historico-credito', {idCredit: credit.credit_id});
    }

    getAmount(credit: ICredit) {
        return (credit.quota - credit.debt);
    }

    private getCredits() {
        this.creditsSubs = this.actionSub
            .pipe(filter((action: SetMyCreditsAction) => action.type === SET_MY_CREDITS))
            .subscribe((res: SetMyCreditsAction) => {
                this.credits = res.credits;
                this.store.dispatch(new LoadingOff());
                if (!this.credits || this.credits.length == 0) {
                    this.presentAlert("Te animamos a que sigas pidiendo para asignarte un CUPO. Pronto te contaremos más")
                    this.justBack()
                    return;  
                }
            });
    }

    justBack(){
        this.navigation.justBack();
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

    ngOnDestroy(): void {
        this.creditsSubs.unsubscribe();
    }
}

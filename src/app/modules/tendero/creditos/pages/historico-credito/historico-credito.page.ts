import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelper} from 'src/app/helpers/navigation/navigation.helper';
import {IUser} from 'src/app/interfaces/IUser';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {
    GetDescriptionCreditAction,
    SET_DESCRIPTION_CREDIT,
    SET_MY_CREDITS,
    SetDescriptionCreditAction,
    SetMyCreditsAction
} from '../store/credits.actions';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ICredit} from '../../../../../interfaces/ICredit';
import {IPurchases} from '../../../../../interfaces/IPurchases';

@Component({
    selector: 'app-historico-credito',
    templateUrl: './historico-credito.page.html',
    styleUrls: ['./historico-credito.page.scss'],
})
export class HistoricoCreditoPage implements OnInit, OnDestroy {
    public user: IUser;
    public credit: ICredit;
    public purchases: IPurchases[];
    private idCredit: string;

    private creditsSubs = new Subscription();

    constructor(private route: ActivatedRoute,
                private navigation: NavigationHelper,
                private store: Store<AppState>,
                private router: Router,
                private actionSub: ActionsSubject) {
        this.user = this.route.snapshot.data.user;

        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                if (data.idCredit) {
                    this.idCredit = data.idCredit;
                    this.store.dispatch(new LoadingOn());
                    this.store.dispatch(new GetDescriptionCreditAction(this.user.token, this.idCredit));
                }
            }
        });
    }

    ngOnInit() {
        this.getCredits();
    }

    justBack() {
        this.navigation.justBack();
    }

    private getCredits() {
        this.creditsSubs = this.actionSub
            .pipe(filter((action: SetDescriptionCreditAction) => action.type === SET_DESCRIPTION_CREDIT))
            .subscribe((res: SetDescriptionCreditAction) => {
                this.credit = res.credit[0];
                this.purchases = res.purchases;
                console.log('this.purchases', this.purchases);
                this.store.dispatch(new LoadingOff());
            });
    }

    getAmount(credit: ICredit) {
        return (credit.quota - credit.debt);
    }

    ngOnDestroy(): void {
        this.creditsSubs.unsubscribe();
    }
}

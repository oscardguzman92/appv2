import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../../../../../interfaces/IUser';
import {Storage} from '@ionic/storage';
import {Shop} from '../../../../../models/Shop';
import {AppState} from '../../../compartido/store/assign/assign.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {ASSIGN_BALANCE, AssignBalanceAction, GetAccountAssignAction} from '../../../compartido/store/assign/assign.actions';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ICurrentAccount} from '../../../../../interfaces/ICurrentAccount';
import {LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';

@Component({
    selector: 'app-asignar-saldo',
    templateUrl: './asignar-saldo.page.html',
    styleUrls: ['./asignar-saldo.page.scss'],
})
export class AsignarSaldoPage implements OnInit, OnDestroy {
    public user: IUser;
    public shop: Shop;
    public account: ICurrentAccount;
    public valueForm: FormGroup;

    private accountAssignSubs = new Subscription();

    constructor(
        private route: ActivatedRoute,
        private storage: Storage,
        private store: Store<AppState>,
        private formBuilder: FormBuilder,
        private router: Router,
        private alertController: AlertController,
        public shopSingletonService: ShopSingletonService,
    ) {
        this.shop = this.shopSingletonService.getSelectedShop();
    }

    ngOnInit() {
        this.store.dispatch(new LoadingOn());
        this.user = this.route.snapshot.data['user'];
        this.store.dispatch(new GetAccountAssignAction(this.user.token, null));

        this.accountAssignSubs = this.store.select('assign')
            .pipe(filter(res => res.accountAssign !== null))
            .pipe(map((res: { accountAssign: ICurrentAccount }) => res.accountAssign))
            .subscribe((account: ICurrentAccount) => {
                if (account) {
                    this.account = account;
                    this.initForms();
                    this.valueForm.reset();
                }
            });
    }

    ngOnDestroy() {
        this.accountAssignSubs.unsubscribe();
    }

    assignBalance(form: {value: string}) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new AssignBalanceAction(this.user.token, form.value, this.shop.id));
    }

    private initForms() {
        this.valueForm = this.formBuilder.group({
            value: ['', [Validators.required, Validators.min(1000), Validators.max(this.account.saldo)]]
        });
    }
}

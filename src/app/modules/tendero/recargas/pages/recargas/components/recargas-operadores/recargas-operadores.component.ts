import {Component, OnInit, Input} from '@angular/core';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {AppState} from '../../../../store/topUps/topUps.reducer';
import {Store} from '@ngrx/store';
import {SetTopUpsSelectedAction} from '../../../../store/topUps/topUps.actions';
import {IProductService} from '../../../../../../../interfaces/IProductService';
import {IUser} from '../../../../../../../interfaces/IUser';
import {TopUpsService} from '../../../../../../../services/topUps/top-ups.service';

@Component({
    selector: 'app-recargas-operadores',
    templateUrl: './recargas-operadores.component.html',
    styleUrls: ['./recargas-operadores.component.scss'],
})
export class RecargasOperadoresComponent implements OnInit {

    @Input() operadores: IProductService[];
    @Input() user: IUser;

    constructor(private store: Store<AppState>, private topupsService: TopUpsService) {
    }

    ngOnInit() {
    }

    async goDoCharge(operator: IProductService) {
        const validate = await this.topupsService.validatePass(this.user, this.operadores, operator);
        if (validate) {
            this.store.dispatch(new SetTopUpsSelectedAction(this.operadores, operator));
        }
    }

}

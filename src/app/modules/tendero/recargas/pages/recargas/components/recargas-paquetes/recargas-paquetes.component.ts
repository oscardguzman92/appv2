import {Component, OnInit, Input} from '@angular/core';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {IProductService} from '../../../../../../../interfaces/IProductService';
import {SetTopUpsSelectedAction} from '../../../../store/topUps/topUps.actions';
import {AppState} from '../../../../store/topUps/topUps.reducer';
import {Store} from '@ngrx/store';
import {TopUpsService} from '../../../../../../../services/topUps/top-ups.service';
import {IUser} from '../../../../../../../interfaces/IUser';

@Component({
    selector: 'app-recargas-paquetes',
    templateUrl: './recargas-paquetes.component.html',
    styleUrls: ['./recargas-paquetes.component.scss'],
})
export class RecargasPaquetesComponent implements OnInit {

    @Input() packages: IProductService[];
    @Input() user: IUser;
    packagesFilter: IProductService[] = [];

    public operadores: {name: string, activeFilter: boolean}[] = [];

    constructor(private navigation: NavigationHelper, private store: Store<AppState>, private topupsService: TopUpsService) {
    }

    ngOnInit() {
        this.packages.forEach((value) => {
            const operadorFilter = this.operadores.filter((operator) => {
                return operator.name === value.operador;
            });

            if (operadorFilter.length === 0) {
                this.operadores.push({name: value.operador, activeFilter: false});
            }
        });
    }

    filterPackagesByOperator(operador: {name: string, activeFilter: boolean}) {
        operador.activeFilter = !operador.activeFilter;

        if (operador.activeFilter) {
            const packagesFiltered = this.packages.filter((packageFilter) => {
                return packageFilter.operador === operador.name;
            });

            if (packagesFiltered.length > 0) {
                this.packagesFilter = packagesFiltered.concat(this.packagesFilter);
            }
            return;
        }

        this.packagesFilter = this.packagesFilter.filter((packageItem) => {
            return packageItem.operador !== operador.name;
        });
    }

    async goDoCharge(packageselected: IProductService) {
        const validate = await this.topupsService.validatePass(this.user, this.packages, packageselected);
        if (validate) {
            this.store.dispatch(new SetTopUpsSelectedAction(this.packages, packageselected));
        }
    }
}

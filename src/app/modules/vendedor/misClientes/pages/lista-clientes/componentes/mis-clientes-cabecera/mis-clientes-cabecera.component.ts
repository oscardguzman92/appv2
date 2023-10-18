import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {AppState} from '../../../../../../../store/app.reducer';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {ToggleMenu} from '../../../../../../compartido/general/store/actions/menu.actions';
import {NavigationHelper} from '../../../../../../../helpers/navigation/navigation.helper';
import {Seller} from '../../../../../../../models/Seller';
import { Subscription } from 'rxjs';
import { Roles } from 'src/app/enums/roles.enum';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';

@Component({
    selector: 'app-mis-clientes-cabecera',
    templateUrl: './mis-clientes-cabecera.component.html',
    styleUrls: ['./mis-clientes-cabecera.component.scss'],
})
export class MisClientesCabeceraComponent implements OnInit {
    @Input() user: Seller;
    @Output() clickFilter = new EventEmitter();
    @Input() showBackButton: boolean = false;
    public showAlert: boolean;
    public cronDate: Date;
    isOfflineActive: boolean;
    public offlineSubs = new Subscription();

    constructor(
        private modal: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private superSellerService: SuperSellerService) {

        this.showAlert = false;
        this.cronDate = new Date();
    }

    ngOnInit() {
        this.timeAlert();

        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        });
    }

    onClickFilter() {
        this.clickFilter.emit();
    }
    
    justBack(){
        if (this.superSellerService.idSuperSeller) {
            this.navigation.goTo('inicio-super-vendedor');            
        }else{
            this.navigation.justBack();
        }
    }

    toggleMenu() {
        this.store.dispatch(new ToggleMenu());
    }

    get formatHour() {
        return this.cronDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    private timeAlert() {
        const timeCron = this.user.distribuidor.hora_cron_envio_pedidos.split(':');
        const hourCron = timeCron[0];
        const minutesCron = timeCron[1];
        const minuteRank = 30;

        this.cronDate.setHours(hourCron);
        this.cronDate.setMinutes(minutesCron);

        if (this.minutesBefore(hourCron, minutesCron, minuteRank) && this.minutesLater(hourCron, minutesCron, minuteRank)) {
            this.showAlert = true;
        }
    }

    private minutesLater(hourCron, minutesCron, minuteRank): boolean {
        const now = new Date();

        const dateCron = new Date();
        dateCron.setHours(hourCron);
        dateCron.setMinutes(parseInt(minuteRank) + parseInt(minutesCron));

        if (now >= dateCron) {
            return false;
        }

        return true;
    }

    private minutesBefore(hourCron, minutesCron, minuteRank): boolean {
        const now = new Date();

        const dateCron = new Date();
        dateCron.setHours(hourCron);
        dateCron.setMinutes(parseInt(minutesCron));
        dateCron.setMinutes(dateCron.getMinutes() - minuteRank);

        if (now >= dateCron) {
            return true;
        }

        return false;
    }

    ngOnDestroy() {
        this.offlineSubs.unsubscribe();
    }

}

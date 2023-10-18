import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {IProductService} from '../../../../../../../interfaces/IProductService';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IUser} from '../../../../../../../interfaces/IUser';
import {AppState} from '../../../../store/topUps/topUps.reducer';
import {Store} from '@ngrx/store';
import {LoadingOn} from '../../../../../../compartido/general/store/actions/loading.actions';
import {SetTopUpsServiceAction} from '../../../../store/topUps/topUps.actions';
import {Storage} from '@ionic/storage';
import {CacheService} from 'ionic-cache';

@Component({
    selector: 'app-recargas-crear-recarga',
    templateUrl: './recargas-crear-recarga.component.html',
    styleUrls: ['./recargas-crear-recarga.component.scss'],
})
export class RecargasCrearRecargaComponent implements OnInit, OnChanges {
    @Input() selected: IProductService;
    @Input() user: IUser;
    @Output() showFooter: EventEmitter<boolean>;

    public formTopsUps: FormGroup;
    public disabledValue: boolean;

    private passAct: string;
    private min: number;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<AppState>,
        private cache: CacheService) {

        this.cache.getItem('pass_act').then((pass) => {
            this.passAct = pass;
        });

        this.showFooter = new EventEmitter<boolean>();
    }

    ngOnInit() {
        const validatorCellphone = (this.selected.tipo_recarga === 'movil') ? [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(10)
        ] : [
            Validators.required,
        ];

        let value = '';
        if (this.selected) {
            if (this.selected.monto_minimo && this.selected.tipo_producto === 'paquetes') {
                value = this.selected.monto_minimo;
                this.min = this.selected.monto_minimo;
                this.disabledValue = true;
            }
        }

        this.formTopsUps = this.formBuilder.group({
            cellphone: ['', Validators.compose(validatorCellphone)],
            value: [value, Validators.compose([
                Validators.required,
                Validators.min((this.min) ? this.min : 1000),
                Validators.pattern('^[0-9]*$')
            ])]
        });
    }

    sendTopsUps(valuesTopsUps: { cellphone: string, value: any }) {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new SetTopUpsServiceAction(
            this.selected,
            this.user.token,
            valuesTopsUps.value,
            valuesTopsUps.cellphone,
            this.passAct
        ));
    }

    get controls() {
        return this.formTopsUps.controls;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.selected) {
            return;
        }

        if (!this.formTopsUps) {
            return;
        }

        if (changes.selected.currentValue) {
            if (this.selected.tipo_producto === 'paquetes') {
                this.formTopsUps.controls.value.setValue(this.selected.monto_minimo);
            }
        }
    }

    disabledFooter(): void {
        this.showFooter.emit(false);
    }

    enabledFooter(): void {
        this.showFooter.emit(true);
    }
}

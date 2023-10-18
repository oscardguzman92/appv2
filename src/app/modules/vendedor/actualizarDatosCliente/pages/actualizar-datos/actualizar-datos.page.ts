import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Shop} from '../../../../../models/Shop';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {UpdateUserAction} from '../../../../tendero/editarPerfil/store/edit.actions';
import {AppState} from '../../../../../store/app.reducer';
import {ActionsSubject, Store} from '@ngrx/store';
import {AFTER_UPDATE_SHOPKEEPER, AfterUpdateShopKeeperAction, UpdateShopKeeperAction} from '../../store/edit.actions';
import {IUser} from '../../../../../interfaces/IUser';
import {filter} from 'rxjs/operators';
import {SHOPS_PENDING_PRODUCTS, ShopsPendingProductsAction} from '../../../misClientes/store/mis-clientes.actions';
import {Subscription} from 'rxjs';
import {Success} from '../../../../compartido/general/store/actions/sucess.actions';
import {CrearClienteCapturaUbicacionComponent} from '../../../crear-cliente/components/crear-cliente-captura-ubicacion/crear-cliente-captura-ubicacion.component';
import {ModalController} from '@ionic/angular';
import {CapturaUbicacionPage} from '../../components/captura-ubicacion/captura-ubicacion.page';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PhoneNumberValidator} from '../../../../../validators/PhoneNumberValidator';
import {Storage} from '@ionic/storage';

@Component({
    selector: 'app-actualizar-datos',
    templateUrl: './actualizar-datos.page.html',
    styleUrls: ['./actualizar-datos.page.scss'],
})
export class ActualizarDatosPage implements OnInit, OnDestroy {

    public user: IUser;
    public shop: Shop;
    public editable: number;
    public updateAction = new Subscription();
    public typologies;
    public formDocument: FormGroup;
    public formCell: FormGroup;

    constructor(
        private navigation: NavigationHelper,
        private storage: Storage,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private modalController: ModalController,
        private formBuilder: FormBuilder
    ) {
        this.editable = -1;

        this.route.queryParams.subscribe(res => {
            if (!this.router.getCurrentNavigation().extras.state) {
                return this.navigation.goTo('lista-clientes');
            }

            const data = this.router.getCurrentNavigation().extras.state.data;
            const state = this.router.getCurrentNavigation().extras.state;
            this.shop = data.shop;

            this.tipologies();
        });



        this.user = this.route.snapshot.data['user'];

        this.formDocument =  this.formBuilder.group({
            document: ['', [
                Validators.required,
                Validators.pattern('^[0-9]*$'),
            ]]
        });

        this.formCell = this.formBuilder.group({
            cellphone: ['', [
                Validators.required,
                Validators.pattern('^[0-9]*$'),
                PhoneNumberValidator('CO'),
                Validators.maxLength(10),
                Validators.minLength(10)
            ]]
        });
    }

    ngOnInit() {
        this.updateAction = this.actionsSubj
            .pipe(filter((res: AfterUpdateShopKeeperAction) => res.type === AFTER_UPDATE_SHOPKEEPER))
            .subscribe((res) => {
                this.navigation.goTo('lista-clientes', {refresh: true});
                this.store.dispatch(new LoadingOff());
                this.store.dispatch(new Success({message: 'Acabas de actualizar los datos correctamente'}));
            });


    }

    tipologies(){

        this.storage.get('user').then(res => {
            const userD = JSON.parse(res);
            this.typologies = userD.tipologias;

            this.typologies.map( (value) => {
                if (value.id === this.shop.tienda_tipologia_id) {
                    value.selected = true;
                    return value;
                }
                return value;
            });
        });


    }


    ngOnDestroy(): void {
        this.updateAction.unsubscribe();
    }

    justBack() {
        this.navigation.justBack();
    }

    goToEditableItem(item: number) {
        this.editable = item;
    }

    get validateFinish() {
        // tslint:disable-next-line: max-line-length
        return this.shop.nombre_contacto || this.shop.nombre_tienda || this.shop.cedula_distribuidor || this.shop.barrio || this.shop.tipologia;
    }

    edit() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new UpdateShopKeeperAction(this.shop, this.user.token));
    }

    goToCapturaUbicacion() {
        this.modalController.create(<any>{
            component: CapturaUbicacionPage,
            componentProps: {
                shop: this.shop,
                seller: this.user
            }
        }).then((modal) => {
            modal.present();

            modal.onDidDismiss().then(res => {
                if (!res.data) {
                    return;
                }

                if (!res.data.shop) {
                    return;
                }
                this.shop = res.data.shop;
            });
        });
    }
    onChange($e) {
        console.log({$e});
        this.typologies.map( (value) => {
            if (value.id !== $e.id) {
                value.selected = false;
                return value;
            } else {
                value.selected = true;
            }
            return value;
        });
        this.shop.tienda_tipologia_id = $e.id;
        this.shop.tipologia = $e.nombre;
    }


    // Getters form
    get document() {
        return this.formDocument.get('document');
    }

    get cellphone() {
        return this.formCell.get('cellphone');
    }
}

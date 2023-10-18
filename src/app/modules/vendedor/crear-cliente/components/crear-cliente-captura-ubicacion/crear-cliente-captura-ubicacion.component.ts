import {Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AlertController, ModalController, Platform, ToastController} from '@ionic/angular';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {Storage} from '@ionic/storage';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {AnalyticsService} from '../../../../../services/analytics/analytics.service';
import {Device} from '@ionic-native/device/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {LoadingOff, LoadingOn} from '../../../../compartido/general/store/actions/loading.actions';
import {Shopkeeper} from '../../../../../models/Shopkeeper';
import {AFTER_SET_CLIENT_SHOP, AfterSetClientShopAction, SetClientShopAction} from '../../../../tendero/registro/store/registro.actions';
import {Seller} from '../../../../../models/Seller';
import {filter} from 'rxjs/operators';
import { MsgErrorService } from 'src/app/services/api/msg-error.service';

declare var google;

@Component({
    selector: 'app-crear-cliente-captura-ubicacion',
    templateUrl: './crear-cliente-captura-ubicacion.component.html',
    styleUrls: ['./crear-cliente-captura-ubicacion.component.scss'],
})
export class CrearClienteCapturaUbicacionComponent implements OnInit, OnDestroy {
    @Input() shopkeeper: Shopkeeper;
    @Input() seller: Seller;
    @ViewChild('inputSearchAddress') inputSearchAddress: any;
    @ViewChild('map') mapElement: ElementRef;
    @ViewChild('myInput') myInput: ElementRef;
    map: any;
    statusSearchAddress: number = 0;
    statusEditAddress: boolean = false;
    statusInfoAddress: boolean = false;
    formData: FormGroup;
    googlePlaces: any;
    autocompleteItems: any[];
    canTypeSearch: boolean = true;
    geocoder: any;
    timeoutCanSearch: any;
    lastSearch: string;
    isEdit: boolean;
    editable: string;
    addressObj: {
        route: string;
        completeAddress: string;
        editableAddress: any;
        cityAddress: any;
    } = {
        route: '',
        completeAddress: '',
        editableAddress: [],
        cityAddress: '',
    };
    showLastSearch: boolean;
    private responseSetShopSubscribe = new Subscription();


    constructor(
        public platform: Platform,
        private navigation: NavigationHelper,
        private modalController: ModalController,
        private formBuilder: FormBuilder,
        private geolocation: Geolocation,
        private store: Store<AppState>,
        private actionsSubj: ActionsSubject,
        private storage: Storage,
        private zone: NgZone,
        private toast: ToastController,
        private diagnostic: Diagnostic,
        private analyticsService: AnalyticsService,
        private device: Device,
        private msgErrorService: MsgErrorService,
        private nativeSettings: OpenNativeSettings,
        private alertController: AlertController) {
        this.lastSearch = '';
    }

    ngOnInit() {
        this.currentLocation();

        this.iniForm();

        this.responseSetShopSubscribe = this.actionsSubj
            .pipe(filter((res: AfterSetClientShopAction) => res.type === AFTER_SET_CLIENT_SHOP))
            .subscribe((res: AfterSetClientShopAction) => {
                const tel = (this.seller.distribuidor && this.seller.distribuidor.telefono) ?
                    'Solicitala a ' + this.seller.distribuidor.telefono : '';
                
               /*if(!res.update){
                    this.presentAlert("Los datos del Cliente fueron actualizados" , true);                    
                }*/
                    this.presentAlert('Estimado vendedor, \n' +
                    'el cliente ha sido creado y requiere de aprobación por parte del distribuidor. Recuerda que podrás tomar  el pedido ' +
                    'en este momento y podrá ser facturado luego de dicha aprobación. ' + tel);
                
                this.navigation.goTo(this.seller.rootPage, {refresh: true});
                this.modalController.dismiss();
            });
    }

    iniForm() {
        this.formData = this.formBuilder.group({
            departament_id: ['', []],
            departament: ['', []],
            city_id: ['', []],
            city: ['', [Validators.required]],
            address: ['', [Validators.required]],
            lng: ['', [Validators.required]],
            lat: ['', [Validators.required]],
            descriptionAdrress: ['', []],
        });
    }

    loadMapLatLng(lat, lng, setAddress = true, placeId?) {
        try {
            this.statusEditAddress = false;
            this.statusInfoAddress = true;
            this.statusSearchAddress = 2;
            let latLng = new google.maps.LatLng(lat, lng);
            let mapOptions = {
                center: latLng,
                zoom: 18,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                clickableIcons: false
            };
            // Traer dirección
            this.getAddressFromCoords(lat, lng, setAddress, placeId);
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.lat.setValue(lat);
            this.lng.setValue(lng);

            this.store.dispatch(new LoadingOff());

            this.map.addListener('tilesloaded', (e) => {
                this.lat.setValue(this.map.center.lat());
                this.lng.setValue(this.map.center.lng());
                this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng(), setAddress, placeId);
                placeId = null;
                setAddress = true;
            });
        } catch (error) {
            // handle error
            this.analyticsService.sendEvent('click', {'event_category': 'registro_mapa', 'event_label': 'error_codigo_45'});
            this.presentError('Ocurrió un error al cargar el mapa. Err. 45', () => {
                this.modalController.dismiss({
                    'finishProcess': false
                });
            });
        }
    }

    iniAutocompleteAddress() {
        let elem = this.inputSearchAddress.el.children[0].children[0];
        this.googlePlaces = new google.maps.places.PlacesService(elem);
    }

    changeAddress(e) {
        this.lastSearch = e.target.value;
        this.autocompleteItems = [];
        if (this.lastSearch.length >= 4) {
            if (!this.canTypeSearch) {
                clearTimeout(this.timeoutCanSearch);
                this.canTypeSearch = true;
            }
            this.canTypeSearch = false;
            this.timeoutCanSearch = setTimeout(() => this.autocompleteAddress(this.lastSearch), 2500);
        } else {
            clearTimeout(this.timeoutCanSearch);
            this.canTypeSearch = true;
        }
    }

    autocompleteAddress(search) {
        this.showLastSearch = false;
        if (search == '') {
            this.canTypeSearch = true;
            return true;
        }
        this.autocompleteItems = [];
        this.geocoder.geocode({
            address: search,
            componentRestrictions: {
                country: 'CO',
            }
        }, (res) => {
            this.zone.run(() => {
                this.canTypeSearch = true;
                if (res.length > 0) {
                    this.autocompleteItems = res.slice(0, 5);
                } else {
                    this.presentToast('No se encontraron resultados de la búsqueda');
                }
                this.showLastSearch = true;
            });
        });
    }

    selectAutocompleteAddress(e) {
        // this.address.setValue(e.formatted_address);
        this.loadMapLatLng(e.geometry.location.lat(), e.geometry.location.lng(), true, e.place_id);
    }

    iniCurrentLocation() {
        this.geocoder = new google.maps.Geocoder();
    }

    async currentLocation() {
        this.store.dispatch(new LoadingOn(true));
        const opt = {maximumAge: 30000, enableHighAccuracy: true, timeout: 15000};
        this.geolocation.getCurrentPosition(opt).then((resp) => {
            this.iniCurrentLocation();
            this.loadMapLatLng(resp.coords.latitude, resp.coords.longitude);
        }).catch(async (error) => {
            this.analyticsService.sendEvent('click', {'event_category': 'registro_mapa', 'event_label': 'error_codigo_' + error.code});
            this.store.dispatch(new LoadingOff());
            let statusError = false;
            if (this.device.platform === 'Android' || this.device.platform === 'IOs') {
                await this.diagnostic.isLocationEnabled().then((res) => {
                    if (res === false) {
                        this.presentError('Tienes que activar la ubicación de tu celular. Err. ' + error.code, () => {
                            this.modalController.dismiss({
                                'finishProcess': false
                            });
                            this.nativeSettings.open('location');
                        });
                        statusError = true;
                    }
                }).catch((e) => {
                    this.presentError(
                        'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err. ' + error.code,
                        () => {
                            this.modalController.dismiss({
                                'finishProcess': false
                            });
                            statusError = true;
                            this.nativeSettings.open('location');
                        }
                    );
                });
            }
            if (!statusError) {
                const message = (error.code === 3) ?
                    'Error obteniendo la ubicación, verifica que tengas activa la ubicación de tu celular. Err.' :
                    'Tienes que permitir la ubicación a storeapp. Err. ';

                this.presentError(message + error.code, () => {
                    this.modalController.dismiss({
                        'finishProcess': false
                    });
                    this.nativeSettings.open('location');
                });
            }
            return;
        });
    }

    getAddressFromCoords(latitude, longitude, setAddress = true, placeId?) {
        const latlng = new google.maps.LatLng(latitude, longitude);
        let request: any = {'location': latlng};
        if (placeId) {
            request = {'placeId': placeId};
        }
        this.geocoder.geocode(request, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                this.addressObj = {
                    route: '',
                    completeAddress: '',
                    editableAddress: [],
                    cityAddress: ''
                };
                let address = results[0];
                if (!address) {
                    this.presentToast('No se encontraron resultados de la búsqueda');
                    return;
                }
                address.address_complete_format = address.formatted_address;
                this.lastSearch = address.address_complete_format;
                const response = this.searchAddresWithDash(results);
                if (response !== false) {
                    address = response;
                }
                if (address) {
                    this.selectedCityFromGoogle(address.address_components);
                    if (setAddress) {
                        this.lastSearch = address.address_complete_format;
                        this.address.setValue(address.address_complete_format);
                    }
                } else {
                    this.presentToast('No se encontraron resultados de la búsqueda');
                }
            } else {
                this.presentToast('Ocurrió un error al buscar la dirección: ' + status);
            }
        });
    }

    selectedCityFromGoogle(address_components) {
        for (let i = 0; i < address_components.length; i++) {
            const element = address_components[i];
            if (element.types.some(t => t == 'locality')) {
                this.city.setValue(element.long_name);
                break;
            } else if (element.types.some(t => t == 'administrative_area_level_2')) {
                this.city.setValue(element.long_name);
                break;
            } else if (element.types.some(t => t == 'administrative_area_level_1')) {
                this.city.setValue(element.long_name);
                break;
            }
        }
    }

    openSearchAddres() {
        if (this.lastSearch === '') {
            this.lastSearch = this.address.value;
        }
        setTimeout(() => {
            this.iniAutocompleteAddress();
            this.inputSearchAddress.el.setFocus();
            this.inputSearchAddress.el.value = this.lastSearch;
        }, 1000);
        this.statusEditAddress = false;
        this.statusSearchAddress = 1;
    }

    closeSearchAddres() {
        this.statusEditAddress = true;
        this.statusSearchAddress = 2;
    }

    async presentToast(msg) {
        const toast = await this.toast.create({
            message: msg,
            duration: 2000
        });
        toast.present();
    }

    async finish() {
        if (!this.city.valid) {
            this.city.setValue('generica');
        }
        if (this.formData.valid) {
            this.store.dispatch(new LoadingOn());
            this.shopkeeper.tiendas[0].direccion = this.address.value;
            this.shopkeeper.tiendas[0].descripcion_direccion = this.descriptionAdrress.value;
            this.shopkeeper.tiendas[0].longitud = this.lng.value;
            this.shopkeeper.tiendas[0].latitud = this.lat.value;
            this.shopkeeper.tiendas[0].ciudad_id = this.city_id.value;
            this.shopkeeper.tiendas[0].ciudad_nombre = this.city.value;
            this.shopkeeper.tiendas[0].nuevaSucursal = (this.shopkeeper.tiendas[0].nuevaSucursal && this.shopkeeper.tiendas[0].nuevaSucursal == true )?true:false;
            
            console.log(this.shopkeeper,"desde captura ubica");
            console.log(this.seller);
            if (this.seller.distribuidor) {
                this.store.dispatch(new SetClientShopAction(this.shopkeeper, this.seller.distribuidor.id, this.seller.token));
            }
        } else {
            let error = await this.msgErrorService.getErrorIntermitencia();            
            let nError = '';
            if (!this.city.valid) {
                nError += '1';
            }
            if (!this.lat.valid) {
                nError += '2';
            }
            if (!this.address.valid) {
                nError += '3';
                error += ". Por favor verifica que cuentes con conexión a internet para poder obtener la dirección correctamente";
            }
            if (nError != '') {
                error += '. Err. ' + nError;
            }
            this.presentToast(error);
        }
    }

    justBack() {
        this.modalController.dismiss({
            'finishProcess': false
        });
    }

    editAddress() {
        if (this.isEdit === true) {
            this.address.setValue(
                this.addressObj.route + '#' + this.addressObj.editableAddress[0] + '-' + this.editable + this.addressObj.cityAddress);
            this.isEdit = !this.isEdit;
            this.addressObj.editableAddress[1] = this.editable;
            return;
        }

        if (!this.isEdit) {
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 300);
        }

        this.editable = this.addressObj.editableAddress[1];
        this.isEdit = !this.isEdit;
    }


    searchByAddress(lastSearch) {
        this.store.dispatch(new LoadingOn());
        this.geocoder.geocode({
            address: lastSearch,
            componentRestrictions: {
                country: 'CO',
            }
        }, (res) => {
            if (res.length === 0) {
                this.statusEditAddress = false;
                this.statusInfoAddress = true;
                this.statusSearchAddress = 2;
                this.lastSearch = lastSearch;
                this.address.setValue(lastSearch);
                this.store.dispatch(new LoadingOff());
                return;
            }
            const location = res[0];
            this.loadMapLatLngWithAddress(
                location.geometry.location.lat(), location.geometry.location.lng(), lastSearch, true, true);
        }, err => {
            this.statusEditAddress = false;
            this.statusInfoAddress = true;
            this.statusSearchAddress = 2;
            this.lastSearch = lastSearch;
            this.address.setValue(lastSearch);
            this.store.dispatch(new LoadingOff());
        });
    }

    loadMapLatLngWithAddress(lat, lng, address, setAddress = true, first = false) {
        try {
            this.statusEditAddress = false;
            this.statusInfoAddress = true;
            this.statusSearchAddress = 2;
            let latLng = new google.maps.LatLng(lat, lng);
            let mapOptions = {
                center: latLng,
                zoom: 18,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                clickableIcons: false
            };
            // Traer dirección
            this.lastSearch = address;
            this.address.setValue(address);
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.lat.setValue(lat);
            this.lng.setValue(lng);

            this.store.dispatch(new LoadingOff());

            this.map.addListener('tilesloaded', (e) => {
                if (first === false) {
                    this.lat.setValue(this.map.center.lat());
                    this.lng.setValue(this.map.center.lng());
                    this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng(), setAddress);
                    setAddress = true;
                    return;
                }

                first = false;
            });
        } catch (error) {
            // handle error
            this.analyticsService.sendEvent('click', {'event_category': 'registro_mapa', 'event_label': 'error_codigo_45'});
            this.presentError('Ocurrió un error al cargar el mapa. Err. 45', () => {
                this.modalController.dismiss({
                    'finishProcess': false
                });
            });
        }
    }

    ngOnDestroy(): void {
        this.responseSetShopSubscribe.unsubscribe();
    }

    public get departament() {
        return this.formData.get('departament');
    }

    public get city_id() {
        return this.formData.get('city_id');
    }

    public get city() {
        return this.formData.get('city');
    }

    public get address() {
        return this.formData.get('address');
    }

    public get lng() {
        return this.formData.get('lng');
    }

    public get lat() {
        return this.formData.get('lat');
    }

    public get descriptionAdrress() {
        return this.formData.get('descriptionAdrress');
    }

    private async presentError(err, handle) {
        const alert = await this.alertController.create({
            header: 'Atención',
            message: err,
            buttons: [{
                text: 'Aceptar',
                handler: handle
            }],
            cssClass: 'attention-alert',
        });

        await alert.present();
    }

    private async presentAlert(msj,sinwaapBtn:boolean = false) {
        const buttons = [{text: 'Aceptar'}];
        if (this.seller.distribuidor && this.seller.distribuidor.telefono && !sinwaapBtn ) {
            const obj = {
                text: 'Ir a Whatsapp',
                handler: () => {
                    window.open('https://api.whatsapp.com/send?text=Hola storeapp&phone=+57' + this.seller.distribuidor.telefono, '_blank');
                }
            };
            buttons.push(obj);
        }
        const alert = await this.alertController.create({
            header: 'Atención',
            message: msj,
            buttons: buttons,
            cssClass: 'info-alert',
        });

        await alert.present();
    }

    private searchAddresWithDash(results: any[]) {
        const addressFilter = results.filter((res) => {
            const address = res.formatted_address;

            if (address.indexOf('-') < 0) {
                return false;
            }

            if (address.indexOf('#') < 0) {
                return false;
            }

            return res;
        });

        if (addressFilter.length <= 0) {
            return false;
        }

        const splitAddress = addressFilter[0].formatted_address.split('#');
        if (splitAddress.length <= 0) {
            return false;
        }

        const routeAddress = this.routeAddressFormat(addressFilter[0]);
        if (routeAddress === false) {
            return false;
        }

        const editableAddress = this.getEditableAddress(splitAddress[1]);
        if (editableAddress === false) {
            return false;
        }

        addressFilter[0].route = routeAddress;
        addressFilter[0].completeAddress = splitAddress[1];
        addressFilter[0].editableAddress = editableAddress[0];
        addressFilter[0].address_complete_format = routeAddress + ' # ' + splitAddress[1];

        this.addressObj.route = routeAddress;
        this.addressObj.completeAddress = splitAddress[1];
        this.addressObj.editableAddress = editableAddress[0];
        this.addressObj.cityAddress = editableAddress[1];

        return addressFilter[0];
    }

    private routeAddressFormat(address: any) {
        if (!address.address_components) {
            return false;
        }

        const route = address.address_components.filter(res => {
            return res.types.some(t => t === 'route');
        });

        if (route.length <= 0) {
            return false;
        }

        if (!route[0].long_name) {
            return false;
        }

        return route[0].long_name;
    }

    private getEditableAddress(splitAddress: string) {
        const street = splitAddress.split(',');
        if (street.length <= 0) {
            return false;
        }

        const streetsEditable = street[0].split('-');
        if (streetsEditable.length <= 0) {
            return false;
        }

        delete street[0];
        return [streetsEditable, street.join(',')];
    }
}

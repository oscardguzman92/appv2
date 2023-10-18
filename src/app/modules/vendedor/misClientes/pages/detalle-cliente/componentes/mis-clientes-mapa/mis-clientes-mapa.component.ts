import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { IShops } from 'src/app/interfaces/IShops';
import {Device} from '@ionic-native/device/ngx';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {AlertController} from '@ionic/angular';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {GeolocationHelper} from '../../../../../../../helpers/geolocation/geolocation.helper';
declare var google;

@Component({
    selector: 'app-mis-clientes-mapa',
    templateUrl: './mis-clientes-mapa.component.html',
    styleUrls: ['./mis-clientes-mapa.component.scss'],
})
export class MisClientesMapaComponent implements OnInit {
    showMapa: boolean;
    @ViewChild('map') mapElement: ElementRef;
    @Input() shop: IShops;
    map: any;
    directionsDisplay: any;
    directionsService: any;
    geocoder: any;
    destination: any;
    origin: any;
    end_location: any;
    constructor(
        private geolocation: Geolocation,
        private nativeSettings: OpenNativeSettings,
        private diagnostic: Diagnostic,
        private device: Device,
        private alertController: AlertController,
        private geolocationHelper: GeolocationHelper) {
        this.showMapa = false;

        if (typeof google !== 'undefined') {
            this.directionsService = new google.maps.DirectionsService();
            this.directionsDisplay = new google.maps.DirectionsRenderer();
            this.geocoder = new google.maps.Geocoder();
        }
    }

    ngOnInit() {
        console.log(this.shop);
    }

    showMap() {
        this.showMapa = true;
        this.currentLocation();
    }

    hideMap() {
        this.showMapa = false;
    }

    async currentLocation() {
        const opt = {maximumAge: 30000, enableHighAccuracy: true, timeout: 10000};
        this.geolocation.getCurrentPosition(opt).then((resp) => {
            let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
            this.origin = latLng;

            let mapOptions = {
                center: latLng,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            let map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.directionsDisplay.setMap(map);

            if (this.shop.latitud && this.shop.latitud != "-1" && this.shop.longitud && this.shop.longitud != "-1") {
                this.destination = new google.maps.LatLng(this.shop.latitud, this.shop.longitud);
            } else {
                this.destination = 'Colombia, '+this.shop.ciu_nombre + ',  ' + this.shop.barrio + ', ' + this.shop.direccion;
            }
            this.route(this.directionsDisplay);
        }).catch(async (error) => {
            this.geolocationHelper.showErrorLocation(error);
        });
    }

    route(directionsDisplay) {
        this.directionsService.route({
            origin: this.origin,
            destination: this.destination,
            travelMode: google.maps.TravelMode.DRIVING
        }, (response, status) => {
            console.log(response)
            if(response.routes.length > 0 && response.routes[0].legs.length > 0 && response.routes[0].legs[0].end_location){
                this.end_location = {};
                this.end_location.lat = response.routes[0].legs[0].end_location.lat();
                this.end_location.lng = response.routes[0].legs[0].end_location.lng();
            }
            if (status === 'OK') {
                directionsDisplay.setOptions({ preserveViewport: true });
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    openWaze() {
        if (this.end_location) {
            window.open('https://waze.com/ul?ll=' + this.end_location.lat + ',' + this.end_location.lng + '&navigate=yes');
        } else {
            window.open('https://waze.com/ul?ll=' + this.shop.latitud + ',' + this.shop.longitud + '&navigate=yes');
        }
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
}

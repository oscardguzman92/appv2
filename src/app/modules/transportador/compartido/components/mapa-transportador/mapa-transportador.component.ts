import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IWayPoint} from '../../../../../interfaces/IWayPoint';
import {ICoords} from '../../../../../interfaces/ICoords';
import {UtilitiesHelper} from '../../../../../helpers/utilities/utilities.helper';
declare var google;

@Component({
    selector: 'app-mapa-transportador',
    templateUrl: './mapa-transportador.component.html',
    styleUrls: ['./mapa-transportador.component.scss'],
})
export class MapaTransportadorComponent implements OnInit {

    private map: any;
    private directionsService = new google.maps.DirectionsService();
    private directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    private destination: ICoords | string;
    private orders: number[] = [];

    @Input() limitShowRoute: number;
    @Input() wayPoints: IWayPoint[];
    @Input() origin: ICoords | string;

    @Output() changeOrder = new EventEmitter();

    constructor(private utilities: UtilitiesHelper) {}

    ngOnInit() {
        this.initMap(true, true);
    }

    private loadMap(optimize: boolean = true, firstEnter: boolean = false) {
        const mapEle: HTMLElement = document.getElementById('map');

        this.map = new google.maps.Map(mapEle, {
            center: this.origin,
            zoom: 12,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: true
        });

        this.directionsDisplay.setMap(this.map);

        google.maps.event.addListenerOnce(this.map, 'idle', () => {
            mapEle.classList.add('show-map');
            this.calculateRoute(optimize, firstEnter);
        });
    }

    private calculateRoute(optimize, firstEnter: boolean = false): void {
        const wayp = this.wayPoints.filter((point, index) => {
            this.orders.push(point.orden);
            delete point.orden;
            return index < this.limitShowRoute - 1;
        });
        this.directionsService.route({
            origin: this.origin,
            destination: this.destination,
            waypoints: wayp,
            optimizeWaypoints: optimize,
            travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status)  => {
            if (status === google.maps.DirectionsStatus.OK) {
                if (optimize) {
                    response.routes[0].waypoint_order.push(this.limitShowRoute - 1);
                    this.changeOrder.emit(response.routes[0].waypoint_order);
                }

                this.directionsDisplay.setDirections(response);
                if (firstEnter || !optimize) {
                    let i = 0;
                    for (const route of response.routes[0].legs) {
                        if (i === 0) {
                            i++;
                            this.createMarker(
                                route.start_location, this.orders[response.routes[0].waypoint_order[i - 1]].toString(), false, true
                            );
                            continue;
                        }
                        this.createMarker(
                            route.start_location, this.orders[response.routes[0].waypoint_order[i - 1]].toString(), (i === 1)
                        );
                        i++;
                    }

                    this.createMarker(
                        response.routes[0].legs[i - 1].end_location, (this.orders[response.routes[0].legs.length - 1]).toString()
                    );
                }
            } else {
                alert('Could not display directions due to: ' + status);
            }
        });
    }

    private createMarker(location: ICoords | string, label: string, active: boolean = false, first: boolean = false): void {
        let markerIcon = (active) ? 'marker-active.png' : 'marker.png';
        markerIcon = (first) ? 'marker_origin.png' : markerIcon;

        const image = {
            url: 'assets/images/' + markerIcon,
            labelOrigin: new google.maps.Point(18, 18)
        };

        const marker = new google.maps.Marker({
            position: location,
            map: this.map,
            label: {text: label, color: (active) ? '#2361E7' : '#ffce0d'},
            icon: image,
        });
    }

    private initMap(optimize: boolean = true, firstEnter: boolean = false) {
        if (this.wayPoints && this.wayPoints.length > 0) {
            this.wayPoints = this.wayPoints.map(({address, shopName, ...keepAttrs}) => keepAttrs);
            this.destination = this.wayPoints[this.wayPoints.length - 1].location;
            this.wayPoints.splice(this.wayPoints.length - 1, 1);
            this.loadMap(optimize, firstEnter);
        }
    }

    reloadMap(wayPoints: IWayPoint[], change: boolean) {
        if (!change) {
            return;
        }
        const mapEle: HTMLElement = document.getElementById('map');
        mapEle.innerHTML = '';
        this.wayPoints = wayPoints;
        this.initMap(false);
    }
}

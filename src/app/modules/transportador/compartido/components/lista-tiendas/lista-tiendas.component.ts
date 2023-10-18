import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IWayPoint} from '../../../../../interfaces/IWayPoint';
import {ModalController} from '@ionic/angular';
import {ModalNovedadesComponent} from '../modal-novedades/modal-novedades.component';
import {Transportador} from '../../../../../models/Transportador';

@Component({
    selector: 'app-lista-tiendas',
    templateUrl: './lista-tiendas.component.html',
    styleUrls: ['./lista-tiendas.component.scss'],
})
export class ListaTiendasComponent implements OnInit {
    @Input() wayPoints: IWayPoint[];
    @Input() enabledEditRoutes: boolean;
    @Input() user: Transportador;
    @Input() indexSelected: number;
    @Input() pedidos: Array<any>;
    @Input() limitShowRoute: number;

    @Output() showEditRoute = new EventEmitter();
    @Output() changeEnableEdit = new EventEmitter();
    @Output() changeWayPoints = new EventEmitter();
    @Output() reOrderWayPoints = new EventEmitter();

    public statusWindowShops: boolean;
    public showScrollEvent: boolean;
    public change: boolean;

    @ViewChild('containerRoutes', { read: ElementRef }) containerRoutes: ElementRef;

    constructor(private modalController: ModalController) {
        this.showScrollEvent = false;
        this.change = false;
    }

    ngOnInit() {
    }

    toggleWindowShops() {
        this.statusWindowShops = !this.statusWindowShops;
        this.showEditRoute.emit(this.statusWindowShops);
        setTimeout(() => {
            this.showScrollEvent = (
                ((this.containerRoutes.nativeElement as HTMLElement).clientHeight) <
                ((this.containerRoutes.nativeElement as HTMLElement).scrollHeight)
            );
        }, 500);

        if (this.changeWayPoints && !this.statusWindowShops) {
            this.changeWayPoints.emit(this.change);
        }
    }

    async editRoute(index: number) {
        const modal = await this.modalController.create({
            component: ModalNovedadesComponent,
            cssClass: ['modal-info', 'modal-updates'],
            componentProps: {
                type: 'cambio-orden',
                wayPoints: this.pedidos,
                selected: index,
                indexSelected: this.indexSelected,
                user: this.user
            }
        });

        modal.onDidDismiss()
            .then(response => {
                this.enabledEditRoutes = false;
                this.changeEnableEdit.emit(false);

                if (response.data && response.data.success) {
                    this.change = true;
                    this.reOrderWayPoints.emit(this.pedidos);
                }
            });

        return await modal.present();
    }

    goToOrder() {
        console.log('go to order');
    }

    changeOrder(newOrder: number[]) {
        const wayponits = [];
        for (let i = 0; i < newOrder.length; i++) {
            wayponits[i] = this.wayPoints[newOrder[i]];
        }

        for (let i = 0; i < newOrder.length; i++) {
            this.wayPoints[i] = wayponits[i];
        }
    }
}

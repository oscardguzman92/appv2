import {
    Component,
    Input,
    OnInit,
    ViewChildren,
    QueryList,
    OnDestroy, HostListener, Output, EventEmitter, ViewChild
} from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import {IUser} from '../../../../../interfaces/IUser';
import { ICategory } from 'src/app/interfaces/ICategory';
import { Subscription } from 'rxjs';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';

@Component({
    selector: 'app-pedidos-productos',
    templateUrl: './pedidos-productos.component.html',
    styleUrls: ['./pedidos-productos.component.scss'],
})
export class PedidosProductosComponent implements OnInit, OnDestroy {
    @ViewChildren('containerCards') containerMain: QueryList<any>;
    @Input() user: IUser;
    @Input() finishLoad: boolean;
    @Input() categoriesProds: ICategory[];
    @Input() puntosCompania?: any[];
    @Output() scrollEvent = new EventEmitter();
    @ViewChild(VirtualScrollerComponent) virtual: VirtualScrollerComponent;
    public isOfflineActive: boolean;
    public offlineSubs = new Subscription();
    public actualDate = new Date(new Date().toISOString().split('T')[0]).getTime();

    constructor(private actionsObj: ActionsSubject,
        private store: Store<AppState>) {
    }

    ngOnInit() {
        this.offlineSubs = this.store.select('offline').subscribe(success => {
            this.isOfflineActive = success.active;
        }, error => {
        });
    }

    ngOnDestroy() {
        this.offlineSubs.unsubscribe();
    }

    scrollListener($event:Event){
        this.scrollEvent.emit($event);
    }
    
    convertStringDateToTime(dateString: string) {
        return new Date(dateString).getTime();
    }
}

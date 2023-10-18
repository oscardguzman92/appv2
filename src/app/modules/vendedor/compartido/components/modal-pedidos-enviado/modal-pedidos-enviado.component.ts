import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-modal-pedidos-enviado',
    templateUrl: './modal-pedidos-enviado.component.html',
    styleUrls: ['./modal-pedidos-enviado.component.scss'],
})
export class ModalPedidosEnviadoComponent implements OnInit {
    @Input() exitosos: any[];
    @Input() noEnviados: any[];
    @Input() enConflicto: any[];
    @Input() noEnviadosMonto: any[];

    public openPedidosNoEnviado: boolean;
    public openPedidosEnConflicto: boolean;
    public openPedidosNoEnviadoMonto: boolean;

    constructor(private modal: ModalController) {
        this.openPedidosNoEnviado = false;
        this.openPedidosEnConflicto = false;
        this.openPedidosNoEnviadoMonto = false;
    }

    ngOnInit() {
    }

    closeModal() {
        this.modal.dismiss();
    }
}

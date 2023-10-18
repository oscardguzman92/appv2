import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ValidateLastProductInCarService {
    private alert: any;

    constructor(private alertController: AlertController) {
    }

    async handle(numPedido: string) {
        await this.presentAlert(numPedido);

        return await this.alert.onDidDismiss().then((data) => {
            if (data.data) {
                return data.data;
            }
            return false;
        }, (err) => {
            return false;
        });
    }

    async presentAlert(numPedido: string) {
        this.alert = await this.alertController.create({
            header: 'Información',
            message: '¿Deseas cancelar el pedido #' + numPedido + '?',
            buttons: [{
                text: 'Aceptar',
                handler: () => {
                    this.alert.dismiss(true);
                }
            }, {
                text: 'Cancelar',
                handler: () => {
                    this.alert.dismiss(false);
                }
            }]
        });

        return this.alert.present();
    }
}

import { Roles } from './../../enums/roles.enum';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class MsgErrorService {

  constructor(
    private storage: Storage,
  ) { }

  async getErrorIntermitencia() {
    let user = await this.storage.get('user');
    user = JSON.parse(user);
    let msg;
    if (!user) return;
    switch (user.role) {
        case Roles.seller:
            msg = "No cuenta con conexión a internet, por favor activar el modo sin conexión en el menú";
            break;
        case Roles.shopkeeper:
            msg = "No cuenta con conexión a internet en este momento";
            break;
        default:
            msg = "Intermitencia de señal";
            break;
    }
    return msg;
  }
}

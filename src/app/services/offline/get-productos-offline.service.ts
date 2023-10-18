import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {Config} from '../../enums/config.enum';
import { OfflineService } from './offline.service';

@Injectable({
    providedIn: 'root'
})
export class GetProductosOfflineService {

    constructor(private storage: Storage,private offlineService: OfflineService) {
    }

    /* invoke() {
        return this.storage.get(Config.nombre_archivo_offline)
            .then(res => {
                return {
                    value: res
                };
            }).catch(err => {
                return this.storage.get('getDatosSinConexion');
            });
    } */

    async invoke() {
        //return this.storage.get(Config.nombre_archivo_offline)
        const v_id = await this.get_vid();
        const day_number= new Date().getDay();
        return this.offlineService.getOfflineDataFromCouchDB(v_id,day_number)
            .then(res => {
                this.offlineService.clearData();
                return {
                    value: res
                };
            }).catch(err => {
                return this.storage.get('getDatosSinConexion');
            });
    }

    get_vid(){
        return this.storage.get("user")
            .then(res => {
                return JSON.parse(res).v_id
            }).catch(err => {
                return this.storage.get('getDatosSinConexion');
            });
    }
}

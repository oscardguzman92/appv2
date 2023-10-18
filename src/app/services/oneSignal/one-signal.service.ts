import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device/ngx';
import {OneSignal} from '@ionic-native/onesignal/ngx';
import {ApiService} from '../api/api.service';
import {Storage} from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class OneSignalService {

    public player_id: string | boolean = '';

    constructor(private device: Device, private oneSignal: OneSignal, private api: ApiService, private storage: Storage) {
    }


    public async deletePlayerId(token: string) {
        const player_id = await this.getId();
        if (player_id !== false) {
            return this.api.post('deleteIdOneSignal?token=' + token, {player_id: player_id}, true);
        }
        return;
    }

    public async getId() {
        //if (this.device.platform === 'iOS') return false;
        this.player_id = await this.validateIdStorage();

        if (this.player_id !== false) {
            return this.player_id;
        }

        if (this.device.platform === 'browser') {
            this.player_id = false;
            return this.player_id;
        }

        this.oneSignal.startInit('370a027e-cc91-4579-b0f5-e2fbb98b5df6', '752498946722');
        this.player_id = await this.oneSignal.getIds()
            .then((res) => {
                if (res) {
                    return res.userId;
                }
                return false;
            }).catch((err) => {
                return false;
            });
        this.oneSignal.endInit();
        await this.storage.set('player_id', this.player_id);
        return this.player_id;
    }

    private validateIdStorage() {
        return this.storage.get('player_id')
            .then(res => {
                if (res) {
                    console.log(res);
                    return res;
                }
                return false;
            }).catch(err => {
                return false;
            });
    }

}

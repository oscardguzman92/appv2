import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {ILogin} from '../../interfaces/ILogin';
import {Storage} from '@ionic/storage';
import {UserBuilder} from '../../builders/user.builder';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private api: ApiService,
        private storage: Storage) {
    }

    login(loginCredentials: ILogin) {
        return this.api.post('getLoginCliente', loginCredentials, true);
    }

    async isAuth() {
        const userStorage = await this.storage.get('user');
        if (userStorage) {
            return new UserBuilder(JSON.parse(userStorage));
        }

        return false;
    }
}

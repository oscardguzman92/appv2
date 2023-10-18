import {Injectable} from '@angular/core';
import {CanLoad, Route, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {AuthService} from '../services/auth/auth.service';
import { Storage } from '@ionic/storage';
import { SuperSellerService } from '../services/users/super-seller.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanLoad {

    constructor(
        private nav: NavController, 
        private auth: AuthService,
        private storage: Storage,
        private superSellerService: SuperSellerService) {
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        return this.auth.isAuth()
            .then(async user => {
                let userSuperSellerTemp = await this.storage.get('userSuperSellerTemp');
                if (userSuperSellerTemp) {
                    userSuperSellerTemp = JSON.parse(userSuperSellerTemp);
                    this.superSellerService.idSuperSeller = userSuperSellerTemp.super_vendedor_id;
                }
                if (user !== false) {
                    return true;
                }

                this.nav.navigateRoot('inicio');
                return false;
            });
    }
}

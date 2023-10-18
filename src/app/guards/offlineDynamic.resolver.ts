import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanLoad, Resolve, Route, RouterStateSnapshot, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import {Storage} from '@ionic/storage';
import {CacheService} from 'ionic-cache';

@Injectable({
    providedIn: 'root'
})
export class OfflineDynamicResolver implements Resolve<any> {

    constructor(private storage: Storage, private cache: CacheService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return this.cache.getItem('offlineDynamic')
            .then((res) => {
                return true;
            }).catch(() => {
                return false;
            });
    }
}

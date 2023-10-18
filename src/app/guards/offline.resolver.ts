import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanLoad, Resolve, Route, RouterStateSnapshot, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import {Storage} from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class OfflineResolver implements Resolve<any> {

    constructor(private storage: Storage, private auth: AuthService, private store: Store<AppState>) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return this.storage.get('withoutConnection')
            .then(() => {
                return true;
            }).catch(() => {
                return false;
            });
    }
}

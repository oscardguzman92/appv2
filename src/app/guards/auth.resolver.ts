import {Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import {SetUserAction} from '../store/auth/auth.actions';
import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class AuthResolver implements Resolve<any> {
    constructor(private store: Store<AppState>, private auth: AuthService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return this.auth.isAuth()
            .then(user => {
                if (user !== false) {
                    return user.getUser();
                }
            });
    }
}
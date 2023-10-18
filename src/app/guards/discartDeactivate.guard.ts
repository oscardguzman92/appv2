import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {AuthService} from '../services/auth/auth.service';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DiscartDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

    constructor(private nav: NavController, private auth: AuthService, private store: Store<AppState>) {
    }

    canDeactivate(component: CanComponentDeactivate, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return component.canDeactivate();
    }

}

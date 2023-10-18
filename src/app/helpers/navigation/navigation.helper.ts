import {Injectable} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationExtras, Router} from '@angular/router';
import {AnalyticsService} from 'src/app/services/analytics/analytics.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationHelper {
    public params: NavigationExtras;
    public noPurchase = false;
    public theLocalStrorageWasAlreadyRead = true;

    constructor(private nav: NavController, private analytics: AnalyticsService ) {
    }

    goTo(ruta: string, params?: any) {
        if (params) {
            this.params = <NavigationExtras> {
                state: {
                    data: params
                }
            };

            this.analytics.sendEvent("page_view", { page: ruta});
            this.analytics.screen(ruta);
            this.nav.navigateRoot(ruta, this.params);
            return;
        }
        
        this.analytics.sendEvent("page_view", { page: ruta });
        this.analytics.screen(ruta);
        this.nav.navigateRoot(ruta);
    }
    
    goToBack(ruta: string, params?: any) {
        if (params) {
            this.params = <NavigationExtras> {
                state: {
                    data: params
                }
            };
            
            this.analytics.sendEvent("page_view", { page: ruta });
            this.analytics.screen(ruta);
            this.nav.navigateForward(ruta, this.params);
            return;
        }
        
        this.analytics.sendEvent("page_view", { page: ruta });
        this.analytics.screen(ruta);
        this.nav.navigateForward(ruta);
    }

    justBack() {
        this.nav.pop();
    }
}

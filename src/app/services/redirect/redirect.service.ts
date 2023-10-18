import {Injectable} from '@angular/core';
import {Roles} from '../../enums/roles.enum';
import {Shopkeeper} from '../../models/Shopkeeper';
import {routes} from '../../app-routing.module';
import {ICompany} from '../../interfaces/ICompany';
import {IUser} from '../../interfaces/IUser';
import {AnalyticsService} from '../analytics/analytics.service';
import {NavigationHelper} from '../../helpers/navigation/navigation.helper';
import {Storage} from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class RedirectService {
    private typeObject: string;

    constructor(private analyticsService: AnalyticsService, private navigation: NavigationHelper, private storage: Storage) {
    }

    // tslint:disable-next-line: max-line-length
    public redirect(tipoRedireccion, user: IUser, data: {interna_id?: number, id: number, link_externo: string, wysiwyg?: string, title?: string, subtitle?: string}) {
        if (data.link_externo) {
            this.redirectExternal(user, data);
            return;
        }

        const seccion = tipoRedireccion.seccion;
        if (seccion !== undefined) {
            const sectionGoTo = seccion.toString();
            this.redirectSeccion(sectionGoTo, user, data);
            return;
        }

        if (tipoRedireccion.compania_id !== undefined) {
            this.redirectCompania(tipoRedireccion.compania_id, user, data);
            return;
        }
    }

    public setTypeObject(type: string): void {
        this.typeObject = type;
    }

    // tslint:disable-next-line: max-line-length
    private redirectSeccion(sectionGoTo, user: IUser, data: {interna_id?: number, id: number, wysiwyg?: string, title?: string, subtitle?: string}) {
        try {
            let goToSection = '', params = null;
            switch (sectionGoTo) {
                case 'puntos':
                    if (user.role !== Roles.shopkeeper) {
                        return false;
                    }
                    const shopkeeper = <Shopkeeper> user;
                    params = {shop: shopkeeper.tiendas[0]};
                    goToSection = 'puntos';
                    break;
                case 'wysiwyg-banner':
                    // tslint:disable-next-line: max-line-length
                    params = {role: user.role, wysiwyg: data.wysiwyg, title: data.title, subtitle: data.subtitle, id: data.id, interna_id: data.interna_id};
                    goToSection = 'wysiwyg-banner';
                    break;
                default:
                    goToSection = sectionGoTo;
                    break;
            }

            const iRoutes = routes.findIndex(r => r.path === goToSection);
            if (iRoutes === -1) {
                return false;
            }

            this.analyticsService.sendEvent('os_notification_opened', {
                'notification_id': data.id,
                'firebase_screen': goToSection,
                'campaign': this.typeObject,
                'source': user.role,
            });
            setTimeout(() => {
                this.navigation.goToBack(goToSection, params);
            }, 100);

        } catch (err) {
            console.log(err);
        }
    }

    private redirectCompania(compania_id: number, user: IUser, data: {id: number}) {
        if (user.role === Roles.seller) {
            return;
        }

        this.analyticsService.sendEvent('os_notification_opened', {
            'notification_id': data.id,
            'firebase_screen': 'compania',
            'campaign': this.typeObject,
            'source': user.role,
        });

        const tiendas = user.tiendas;
        if (tiendas !== undefined && Array.isArray(user.tiendas) && user.tiendas.length > 1) {
            this.navigation.goTo('inicio-tendero');
            return;
        }

        const shopkeeper = <Shopkeeper> user;
        shopkeeper.compania = <ICompany> {id: compania_id};
        this.storage.set('user', JSON.stringify(shopkeeper))
            .then(() => {
                this.navigation.goToBack('compania');
            });

    }

    private redirectExternal(user: IUser, data: {id: number, link_externo: string}) {
        this.analyticsService.sendEvent('os_notification_opened', {
            'notification_id': data.id,
            'firebase_screen': 'enlace_externo',
            'campaign': this.typeObject,
            'source': user.role,
        });
        window.open(data.link_externo, '_blank');
    }
}

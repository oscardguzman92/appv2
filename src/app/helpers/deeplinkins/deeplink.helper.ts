import {IDeeplink} from '../../interfaces/IDeeplink';
import {NavigationHelper} from '../navigation/navigation.helper';
import {IUser} from '../../interfaces/IUser';
import {Shop} from '../../models/Shop';
import {SetOrderShopAction} from '../../modules/compartido/pedidos/store/orders.actions';
import {Order} from '../../models/Order';
import {LoadingOn} from '../../modules/compartido/general/store/actions/loading.actions';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';
import { GetAdditionalButtonAction, SetAdditionalButtonAction, SET_BUTTONS_FEATURED } from 'src/app/modules/compartido/general/store/actions/offers.actions';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';


export class DeepComunidad implements IDeeplink {
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>): void {
        setTimeout(() => {
            navigation.goTo('comunidad-tenderos');
        }, 1000);
    }
}

export class DeepPedidos implements IDeeplink {
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>): void {
        if (!user.tiendas[0]) {
            return;
        }
        const shop = new Shop(user.tiendas[0]);
        store.dispatch(new SetOrderShopAction(new Order({ tienda: shop })));
        store.dispatch(new LoadingOn());
        setTimeout(() => {
            navigation.goToBack('pedidos');
        }, 1000);
    }
}


export class DeepBanners implements IDeeplink {
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>): void {
        setTimeout(() => {
            navigation.goTo('productos-destacados');
        }, 1000);
    }
}

export class DeepBancolombia implements IDeeplink {
    public deepLinkWysiwyg = new Subscription();
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>, actionS: ActionsSubject, deeplink_path:string): void {
        setTimeout(() => {
                    store.dispatch(new GetAdditionalButtonAction(user.token, user.tiendas[0].id));
                    this.deepLinkWysiwyg = actionS
                        .pipe(filter(action => action.type === SET_BUTTONS_FEATURED))
                        .subscribe((res: SetAdditionalButtonAction) => {
                            this.deepLinkWysiwyg.unsubscribe();
                            let offers = res.buttonsFatured;
                            let index = offers.findIndex(o => o.interna_id == 2);
                            navigation.goToBack('wysiwyg-banner', offers[index]);
                        }, err => {
                        }, () => {
                    });
                    //navigation.goToBack('wysiwyg-banner');
        }, 1000);
    }
}


export class DeepOffer implements IDeeplink {
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>, actionS: ActionsSubject, deeplink_path:string,storage:Storage, deeplink_data:[]): void {
        setTimeout(() => {
            navigation.goToBack('productos-destacados', {productId : deeplink_data['v'] } );
        }, 1000);
    }
}

export class DeepProducto implements IDeeplink {
    public navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>, actionS: ActionsSubject, deeplink_path:string,storage:Storage, deeplink_data:[], generalObsService: any): void {
  
            storage.get('deeplink')
            .then((deeplinkStorage) => {
                let deepLinkData = JSON.parse(deeplinkStorage);
                if (!deepLinkData) {
                    if(deeplink_data['v'] ==  'p'){
                        deepLinkData = {
                            tipo : deeplink_data['v'],
                            producto : deeplink_data['w'],
                            portafolio : deeplink_data['x'],
                            distribuidor : deeplink_data['y'],
                            categoria : deeplink_data['z'],
                        };
                    }
                    if(deeplink_data['v'] ==  'c'){
                        deepLinkData = {
                            tipo : deeplink_data['v'],
                            producto : deeplink_data['w'],
                            compania : deeplink_data['x'],
                        };                        
                    }                    
  
                    storage.set('deeplink', JSON.stringify(deepLinkData)).then(() => {
                        if (location.pathname.indexOf("inicio-tendero") === -1) {
                            let time = new Date().getSeconds();
                            navigation.goToBack('inicio-tendero/' + time, { deepLinkData: deepLinkData });
                            setTimeout(() => generalObsService.deepPublish({}), 1000);
                        } else if(generalObsService){
                            generalObsService.deepPublish({});
                        }
                    });
                }
            })
            .catch(err => {
            });

    }
}
 

export const routesDeeplinks = {
    '/comunidad': {
        route: new DeepComunidad()
    },
    '/pedidos': {
        route: new DeepPedidos()
    },
    '/banners': {
        route: new DeepBanners()
    },
    '/bancolombia': {
        route: new DeepBancolombia()
    },
    '/producto': {
        route: new DeepProducto()
    },
    '/oferta': {
        route: new DeepOffer()
    }     
};


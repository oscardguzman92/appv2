import { GeneralObsService } from './../services/observables/general-obs.service';
import {NavigationHelper} from '../helpers/navigation/navigation.helper';
import {IUser} from './IUser';
import {ActionsSubject, Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import { Storage } from '@ionic/storage';

export interface IDeeplink {
    navigate(navigation: NavigationHelper, user: IUser, store: Store<AppState>, actionsS?: ActionsSubject, deeplink_path?:string, storage?: Storage, deeplink_data?:[], generalObsService?: GeneralObsService): void;
}

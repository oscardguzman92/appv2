import {Action} from '@ngrx/store';
import {Shop} from '../../../../models/Shop';

export const UPDATE_SHOPKEEPER = '[EDIT] Update shopkeeper';
export const AFTER_UPDATE_SHOPKEEPER = '[EDIT USER] After update shopkeeper';

export class UpdateShopKeeperAction implements Action {
    readonly type = UPDATE_SHOPKEEPER;

    constructor(public shop: Shop, public token: string) {}
}

export class AfterUpdateShopKeeperAction implements Action {
    readonly type = AFTER_UPDATE_SHOPKEEPER;

    constructor(public shop: Shop) {}
}

export type EditActions = UpdateShopKeeperAction | AfterUpdateShopKeeperAction;

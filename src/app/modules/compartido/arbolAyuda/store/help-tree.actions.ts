import { Action } from '@ngrx/store';
import { HelpTreeModel } from '../../../../models/HelpTree';
import { IOption, ITag, IRedirect, IHelpTree } from '../../../../interfaces/IHelpTree';
import { IDistributors } from '../../../../interfaces/IDistributors';

export const HELP_TREE = '[Help tree] Help tree';
export const HELP_TREE_CLICK = '[Help tree] Help tree click';
export const HELP_TREE_COMPLETE = '[Help tree] Help tree complete';
export const HELP_TREE_DISTRIBUTORS = '[Help tree] Help tree distributors';
export const HELP_TREE_DISTRIBUTORS_COMPLETE = '[Help tree] Help tree distributors complete';

export class HelpTreeAction implements Action {
    readonly type = HELP_TREE;

    constructor( public toggle: boolean, public token: string, public role: string ) {}

}

export class HelpTreeCompleteAction implements Action {
    readonly type = HELP_TREE_COMPLETE;

    constructor( public toggle: boolean, public helpTreeElement: IHelpTree[]) {}

}


export class HelpTreeDistributorsAction implements Action {
    readonly type = HELP_TREE_DISTRIBUTORS;

    constructor( public toggle: boolean, public token: string ) {}

}

export class HelpTreeDistributorsCompleteAction implements Action {
    readonly type = HELP_TREE_DISTRIBUTORS_COMPLETE;

    constructor( public toggle: boolean, public distributors: IDistributors[]) {}

}

export class HelpTreeClickAction implements Action {
    readonly type = HELP_TREE_CLICK;

    constructor( public toggle: boolean, public token: string, public id: string , public by: string ) {}

}


export type HelpTreeActions =
HelpTreeAction |
HelpTreeCompleteAction |
HelpTreeDistributorsAction |
HelpTreeDistributorsCompleteAction |
HelpTreeClickAction ;




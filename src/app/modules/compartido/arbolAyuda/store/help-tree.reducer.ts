import {
    HelpTreeActions,
    HELP_TREE,
    HELP_TREE_COMPLETE,
    HELP_TREE_DISTRIBUTORS,
    HELP_TREE_DISTRIBUTORS_COMPLETE
} from './help-tree.actions';

import { HelpTreeModel } from '../../../../models/HelpTree';
import { IOption, ITag, IRedirect, IHelpTree } from '../../../../interfaces/IHelpTree';
import { IDistributors } from '../../../../interfaces/IDistributors';
import { HELP_TREE_CLICK } from './help-tree.actions';



// HelpTreeState
    export interface HelpTreeState {
        active: boolean;
        token: string;
        role: string;
    }

    const InitialHelpTree: HelpTreeState = {
        active: false,
        token: '',
        role: ''
    };

    // tslint:disable-next-line: max-line-length
    export function HelpTreeReducer(state = InitialHelpTree, action: HelpTreeActions ): HelpTreeState {
        switch (action.type) {
            case  HELP_TREE:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                    role: action.role
                };
            default:
                return state;
        }
    }


// HelpTreeClickState
    export interface HelpTreeClickState {
        active: boolean;
        token: string;
        id: string;
        by: string;
    }

    const InitialHelpTreeClick: HelpTreeClickState = {
        active: false,
        token: '',
        id: '',
        by: ''
    };

    // tslint:disable-next-line: max-line-length
    export function HelpTreeClickReducer(state = InitialHelpTreeClick, action: HelpTreeActions ): HelpTreeClickState {
        switch (action.type) {
            case  HELP_TREE_CLICK:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                    id: action.id,
                    by: action.by
                };
            default:
                return state;
        }
    }

// HelpTreeCompleteState
    export interface HelpTreeCompleteState {
        active: boolean;
        helpTreeElement: IHelpTree[];
    }

    const InitialHelpTreeComplete: HelpTreeCompleteState = {
        active: false,
        helpTreeElement: []
    };

    // tslint:disable-next-line: max-line-length
    export function HelpTreeCompleteReducer(state = InitialHelpTreeComplete, action: HelpTreeActions ): HelpTreeCompleteState {
        switch (action.type) {
            case  HELP_TREE_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    helpTreeElement: action.helpTreeElement,
                };
            default:
                return state;
        }
    }


// HelpTreeDistributorsState
    export interface HelpTreeDistributorsState {
        active: boolean;
        token: string;
    }

    const InitialHelpTreeDistributors: HelpTreeDistributorsState = {
        active: false,
        token: ''
    };

    // tslint:disable-next-line: max-line-length
    export function HelpTreeDistributorsReducer(state = InitialHelpTreeDistributors, action: HelpTreeActions ): HelpTreeDistributorsState {
        switch (action.type) {
            case  HELP_TREE_DISTRIBUTORS:
                return {
                    ...state,
                    active: action.toggle,
                    token: action.token,
                };
            default:
                return state;
        }
    }

// HelpTreeDistributorsCompleteState
    export interface HelpTreeDistributorsCompleteState {
        active: boolean;
        distributors: IDistributors[];
    }

    const InitialHelpTreeDistributorsComplete: HelpTreeDistributorsCompleteState = {
        active: false,
        distributors: []
    };

    // tslint:disable-next-line: max-line-length
    export function HelpTreeDistributorsCompleteReducer(state = InitialHelpTreeDistributorsComplete, action: HelpTreeActions ): HelpTreeDistributorsCompleteState {
        switch (action.type) {
            case  HELP_TREE_DISTRIBUTORS_COMPLETE:
                return {
                    ...state,
                    active: action.toggle,
                    distributors: action.distributors,
                };
            default:
                return state;
        }
    }

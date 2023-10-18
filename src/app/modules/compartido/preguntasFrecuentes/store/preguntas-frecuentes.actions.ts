import {Action} from '@ngrx/store';
import {IFrequentlyAsked} from '../../../../interfaces/IFrequentlyAsked';

export const Get_Frequently_Asked = '[FrequentlyAsked] Get Frequently Asked';
export const Set_Frequently_Asked = '[FrequentlyAsked] Set Frequently Asked';



export class GetFrequentlyAskedAction implements Action {
    readonly type = Get_Frequently_Asked;

    constructor(public token: string) {}
}
export class SetFrequentlyAskedAction implements Action {
    readonly type = Set_Frequently_Asked;

    constructor(public frequentQuestions: IFrequentlyAsked) {}
}


export type FrequentlyAskedActions = GetFrequentlyAskedAction | SetFrequentlyAskedAction;

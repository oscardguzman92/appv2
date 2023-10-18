import {FrequentlyAskedActions, Get_Frequently_Asked, Set_Frequently_Asked} from './preguntas-frecuentes.actions';
import {IFrequentlyAsked} from 'src/app/interfaces/IFrequentlyAsked';

export interface FrequentlyAskedState {
    frequentQuestions: IFrequentlyAsked;
}

const frequentlyAskedInitial: FrequentlyAskedState = {
    frequentQuestions: null
};

export function preguntasfrecuentesReducer(state = frequentlyAskedInitial, action: FrequentlyAskedActions): FrequentlyAskedState {
    switch (action.type) {

        case Get_Frequently_Asked:
            return <FrequentlyAskedState> {
                frequentQuestions: null
            };

        case Set_Frequently_Asked:
            return <FrequentlyAskedState> {
                frequentQuestions: {
                    ...action.frequentQuestions
                }
            };

        default:
            return state;
    }
}

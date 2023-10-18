import {GET_MESSAGES, MessagesActions, SET_MESSAGES, SET_READ_MESSAGE} from './messages.actions';
import {IMessages} from '../../../../interfaces/IMessages';

export interface MessagesState {
    messages: IMessages;
}

const messagesInitial: MessagesState = {
    messages: null
};

export function messagesReducer(state = messagesInitial, action: MessagesActions): MessagesState {
    switch (action.type) {

        case GET_MESSAGES:
            return <MessagesState> {
                messages: null
            };

        case SET_MESSAGES:
            return <MessagesState> {
                messages: action.messages
            };

        case SET_READ_MESSAGE:
            return <MessagesState> {
                messages: action.messages
            };

        default:
            return state;
    }
}

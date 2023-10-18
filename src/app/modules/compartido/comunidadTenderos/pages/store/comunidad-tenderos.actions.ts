import {Action} from '@ngrx/store';
import {IShopkeepersCommunity} from '../../../../../interfaces/IShopkeepersCommunity';
import { ICommentsPost } from 'src/app/interfaces/ICommentsPost';
import { IUser } from 'src/app/interfaces/IUser';
import { ISurveys } from 'src/app/interfaces/ISurveys';

export interface IPagShopkeepersCommunity {
        pagination: {
            last_page: number;
            total: number;
            current_page: number;
        },
        posts:  IShopkeepersCommunity[]
        encuestas: {
            last_page: number;
            total: number;
            current_page: number;
            data: ISurveys[]
        },
}

export interface IPagSurveys {

    last_page: number;
    total: number;
    current_page: number;
    data: ISurveys[]
}



export const Get_Shopkeepers_Community = '[ShopkeepersCommunity] Get Shopkeepers Community';
export const Set_Shopkeepers_Community = '[ShopkeepersCommunity] Set Shopkeepers Community';
export const Create_Post = '[ShopkeepersCommunity] Create Post';
export const Set_Create_Post = '[ShopkeepersCommunity] Set Create Post';

export const Set_Like_Post = '[ShopkeepersCommunity] Set Like Post';
export const Add_Like_Post = '[ShopkeepersCommunity] Add Like Post';
export const Get_Comments_Post = '[ShopkeepersCommunity] Get Comments Post';
export const Set_Comments_Post = '[ShopkeepersCommunity] Set Comments Post';
export const Create_Comment_Post = '[ShopkeepersCommunity] Create Comment Post';
export const Get_Surveys = '[ShopkeepersCommunity] Get Surveys';
export const Set_Surveys = '[ShopkeepersCommunity] Set Surveys';
export const Create_Survey = '[ShopkeepersCommunity] Create Survey';
export const Set_Survey = '[ShopkeepersCommunity] Set Survey';




export class GetShopkeepersCommunityAction implements Action {
    readonly type = Get_Shopkeepers_Community;
    constructor(public token: string, public page: number, public callbackEvent?:any) {}
}

export class SetShopkeepersCommunityAction implements Action {
    readonly type = Set_Shopkeepers_Community;
    constructor(public shopkeepersCommunity: IPagShopkeepersCommunity) {}
}

export class CreatePostAction implements Action {
    readonly type = Create_Post; 
    constructor(public token: string, public dataPost: any) {}
}

export class SetCreatePostAction implements Action {
    readonly type = Set_Create_Post; 
    constructor(public res: any) {}
}

export class SetLikePostAction implements Action {
    readonly type = Set_Like_Post; 
    constructor(public token: string, public post_id: string) {}
}

export class addLikePostAction implements Action {
    readonly type = Add_Like_Post; 
    constructor(public post_id: string) {}
}


export class GetCommentsPostAction implements Action {
    readonly type = Get_Comments_Post;
    constructor(public token: string,  public post_id: string ,public page: number) {}
}

export class SetCommentsPostAction implements Action {
    readonly type = Set_Comments_Post;
    constructor(public comments: ICommentsPost[], public post_id: string, public typeAdd: string) {}
}

export class CreateCommentPostAction implements Action {
    readonly type = Create_Comment_Post;
    constructor(public user: IUser, public texto: string, public post_id: string, public post_user_id: number) {}
}

export class GetSurveysAction implements Action {
    readonly type = Get_Surveys;
    constructor(public token: string, public tienda_id: any, public encuesta_id: string, public page: string, public notValidateResponse: boolean) {}
}

export class SetSurveysAction implements Action {
    readonly type = Set_Surveys;
    constructor(public survey: IPagSurveys) {}
}

export class CreateSurveyAction implements Action {
    readonly type = Create_Survey;
    constructor(public token: string, public encuesta_id: number, public data: any) {}
}

export class SetSurveyAction implements Action {
    readonly type = Set_Survey;
    constructor(public n_respuestas: number, public encuesta_id:number) {}
}



export type ShopkeepersCommunityActions = GetShopkeepersCommunityAction | SetShopkeepersCommunityAction | CreatePostAction;

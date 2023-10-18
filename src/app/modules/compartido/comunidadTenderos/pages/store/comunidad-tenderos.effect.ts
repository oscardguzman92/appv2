import { UserSurveysService } from './../../../../../services/users/user-surveys.service';
import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
    Get_Shopkeepers_Community,
    GetShopkeepersCommunityAction,
    SetShopkeepersCommunityAction,
    Create_Post,
    CreatePostAction,
    SetLikePostAction,
    addLikePostAction,
    GetCommentsPostAction,
    SetCommentsPostAction,
    Get_Comments_Post,
    Add_Like_Post,
    CreateCommentPostAction,
    Create_Comment_Post,
    Set_Like_Post,
    SetCreatePostAction,
    Create_Survey,
    CreateSurveyAction,
    SetSurveyAction,
    Get_Surveys,
    GetSurveysAction,
    SetSurveysAction
} from './comunidad-tenderos.actions';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {ApiService} from 'src/app/services/api/api.service';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Fail} from '../../../general/store/actions/error.actions';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
import { LoadingOff } from '../../../general/store/actions/loading.actions';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';

@Injectable({
    providedIn: 'root'
})
export class ShopkeepersCommunityEffect {

    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private store: Store<AppState>,
        private file: File,
        private alertController: AlertController,
        private navigation: NavigationHelper,
        private userSurveysService: UserSurveysService,
    ) {
    }

    @Effect({dispatch: false})
    loadShopkeepersCommunity$ = this.actions$.pipe(
        ofType(Get_Shopkeepers_Community),
        mergeMap((action: GetShopkeepersCommunityAction) => {
            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    page: String(action.page),
                    paginate: 'true'
                }
            });
            //const refresh = (action.callbackEvent)  ? true : false;
            return this.apiService.get('getPostsV2?p-'+action.page, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(shopkeepersCommunity => {
                        if(action.callbackEvent) action.callbackEvent.complete();
                        this.store.dispatch(new SetShopkeepersCommunityAction(shopkeepersCommunity))
                    })
                ).pipe(
                    catchError((error) => {
                        if(action.callbackEvent) action.callbackEvent.complete();
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    createPost$ = this.actions$.pipe(
        ofType(Create_Post),
        mergeMap((action: CreatePostAction) => {
            const params = {
                titulo: action.dataPost.titulo,
                texto: action.dataPost.texto,
                file: action.dataPost.file
            };
            return this.apiService.post('setPost?token='+action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new SetCreatePostAction(res))
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        this.presentAlert(error.content);
                        return of(new Fail(error));
                    })
                );
        })
    );

    
    

    @Effect({dispatch: false})
    setLikePost$ = this.actions$.pipe(
        ofType(Set_Like_Post),
        mergeMap((action: SetLikePostAction) => {
            const params = {
                post_id: action.post_id,
            };
            return this.apiService.post('setMeGusta?token='+action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new addLikePostAction(action.post_id))
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    getCommentsPost$ = this.actions$.pipe(
        ofType(Get_Comments_Post),
        mergeMap((action: GetCommentsPostAction) => {


            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    page: String(action.page),
                    post_id: action.post_id,
                    paginate: 'true'
                }
            });

            return this.apiService.get('getComentarios?token='+action.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content.data;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new SetCommentsPostAction(res, action.post_id, "init"))
                    })
                ).pipe(
                    catchError((error) => {
                        return of(new Fail(error));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    createCommentPost$ = this.actions$.pipe(
        ofType(Create_Comment_Post),
        mergeMap((action: CreateCommentPostAction) => {
            const params = {
                post_id: action.post_id,
                texto: action.texto,
                post_user_id: action.post_user_id,
            };
            const newComment = {
                id: null,
                texto: action.texto,
                user_id: action.user.user_id,
                post_id: Number(action.post_id),
                created_at: "",
                updated_at: "",
                usuario: action.user.nombre_contacto,
            }
            return this.apiService.post('setComentario?token='+action.user.token, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        newComment.id = res.comentario_id;
                        newComment.created_at = res.created_at;
                        this.store.dispatch(new SetCommentsPostAction([newComment], action.post_id, "before"))
                    })
                ).pipe(
                    catchError((error) => {
                        this.presentAlert(error.content);
                        return of(new Fail(error));
                    })
                );
        })
    );

    
    @Effect({dispatch: false})
    getSurveys$ = this.actions$.pipe(
        ofType(Get_Surveys),
        mergeMap((action: GetSurveysAction) => {

            const params = new HttpParams({
                fromObject: {
                    token: action.token,
                    page: String(action.page),
                    tienda_id: (action.tienda_id) ? action.tienda_id: "",
                    encuesta_id: action.encuesta_id,
                }
            });
            let notValidateResponse = (action.notValidateResponse) ? "&notValidateResponse=true" : "";
            return this.apiService.get('getEncuestas?token='+action.token+notValidateResponse, params, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new SetSurveysAction(res))
                    })
                ).pipe(
                    catchError((error) => {
                        this.store.dispatch(new LoadingOff());
                        this.navigation.justBack();
                        this.presentAlert("No se encontró ninguna encuesta pendiente");
                        return of(new Fail(error));
                    })
                );
        })
    );


    @Effect({dispatch: false})
    createSurvey$ = this.actions$.pipe(
        ofType(Create_Survey),
        mergeMap((action: CreateSurveyAction) => {
            let dataendeada = JSON.stringify(action.data["respuestas"]);
            action.data["respuestas"] = dataendeada;
            return this.apiService.post2(this.apiService.getEndpoint()+'setEncuesta?token='+action.token, action.data, true)
                .pipe(
                    map((res) => {
                        if (res.status !== 'error') {
                            return res.content;
                        }
                        throw(res);
                    })
                ).pipe(
                    map(res => {
                        this.store.dispatch(new SetSurveyAction(res.n_respuestas, action.encuesta_id))
                    })
                ).pipe(
                    catchError((error) => {
                        if (error.headers === "" || error.status  === -3) {
                            this.presentAlert("No es posible enviar las respuestas en este momento, van a quedar almacenadas y podrás enviarlas cuando cuentes con mejor señal, desde la opción PENDIENTES");
                            this.setSurveyStorage(action.encuesta_id, action.data);
                        }
                        this.store.dispatch(new LoadingOff());
                        this.store.dispatch(new Fail(error));
                        return of(new Fail(error));
                    })
                );
        })
    );

    setSurveyStorage(survey_id, data) {
        this.userSurveysService.setSurveysStorage({
            survey_id: survey_id,
            data: data,
        });
        //window.location.reload();
        this.navigation.justBack();
    }

    async presentAlert(message:string) {
        const alert = await this.alertController.create({
          header: 'Información',
          subHeader: '',
          message: message,
          buttons: ['Aceptar']
        });
    
        await alert.present();
    }
    
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ComunidadTenderosCrearPostComponent } from './components/comunidad-tenderos-crear-post/comunidad-tenderos-crear-post.component';
import { ModalController, IonInfiniteScroll, AlertController } from '@ionic/angular';
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IShopkeepersCommunity } from 'src/app/interfaces/IShopkeepersCommunity';
import { GetShopkeepersCommunityAction, addLikePostAction, Add_Like_Post, SetShopkeepersCommunityAction, Set_Shopkeepers_Community, SetCommentsPostAction, Set_Comments_Post, SetCreatePostAction, Set_Create_Post, Set_Survey, SetSurveyAction } from '../store/comunidad-tenderos.actions';
import { LoadingOn, LoadingOff } from '../../../general/store/actions/loading.actions';
import {IUser} from '../../../../../interfaces/IUser';
import {ActivatedRoute} from '@angular/router';
import { ISurveys } from 'src/app/interfaces/ISurveys';
import {GetSurveysAction} from '../../../encuestas/store/encuestas.actions';

@Component({
  selector: 'app-comunidad-tenderos',
  templateUrl: './comunidad-tenderos.page.html',
  styleUrls: ['./comunidad-tenderos.page.scss'],
})
export class ComunidadTenderosPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public listPostsNormal:IShopkeepersCommunity[] = [];
  public listSurveys:ISurveys[] = [];
  private maxPaginate:number = 0;
  private nPagePaginate:number = 2;
  private authSubscribe = new Subscription();
  private shopkeepersCommunitySubscribe = new Subscription();
  private actionsAddLike = new Subscription();
  private actionsSetCreatePost = new Subscription();
  private actionsSetSurvey = new Subscription();
  

  @ViewChild('refreshContentElement', {read: ElementRef}) refreshContentElement: ElementRef;
  
  private actionsCommentsPost = new Subscription();
  public user: IUser;

  constructor(public modalController: ModalController,
      private store: Store<AppState>,
      private route: ActivatedRoute,
      private actionsObj: ActionsSubject,
      private modal: ModalController,
      private alertController: AlertController
      ) {}

  ngOnInit() {
    //this.abrirModalCrearPost();
    this.store.dispatch(new LoadingOn());
    this.user = this.route.snapshot.data['user'];
    this.store.dispatch(new GetShopkeepersCommunityAction(this.user.token, 1));

    this.shopkeepersCommunitySubscribe = this.actionsObj.pipe(filter((res: SetShopkeepersCommunityAction) => res.type === Set_Shopkeepers_Community))
      .subscribe((res) => {
        this.maxPaginate = res.shopkeepersCommunity.pagination.last_page;
        // Posts
        if(this.listPostsNormal.length > 0  && res.shopkeepersCommunity.pagination.current_page > 1){
          this.listPostsNormal = [...this.listPostsNormal, ...res.shopkeepersCommunity.posts];
        }else{
          this.listPostsNormal = res.shopkeepersCommunity.posts;
        }
        // Encuestas
        if (res.shopkeepersCommunity.encuestas && res.shopkeepersCommunity.encuestas.data && res.shopkeepersCommunity.encuestas.data.length > 0) {
          this.listSurveys = res.shopkeepersCommunity.encuestas.data;
        }else{
          this.listSurveys = [];
          /* this.listSurveys = [
            {
              "created_at": "2019-11-30 01:56:51",
              "id": 2,
              "nombre": "Encuesta de satisfacción Noviembre 30 de 2019.",
              "preguntas": [
                {
                  "encuesta_tipo_id": 4,
                  "id": 13,
                  "pregunta": "Seleccione su género",
                  "tipo_encuesta": {
                    "id": 4,
                    "slug": "res_unica",
                    "texto": "Única",
                  },
                  "respuestas" : [
                    {
                      "id": 17,
                      "encuesta_id": 1,
                      "orden": 1,
                      "titulo": "Masculino",
                      "valor": "m",
                    }
                  ]
                },
                {
                  "encuesta_tipo_id": 1,
                  "id": 13,
                  "pregunta": "Describa cómo le ha parecido la aplicación storeapp",
                  "tipo_encuesta": {
                    "id": 4,
                    "slug": "res_abierta",
                    "texto": "Abierta",
                  },
                  "respuestas" : []
                }
              ]
            }
          ]; */
        }
        this.store.dispatch(new LoadingOff());
      });

    this.actionsSetCreatePost = this.actionsObj.pipe(filter((res: SetCreatePostAction) => res.type === Set_Create_Post))
      .subscribe((res) => {
        this.store.dispatch(new LoadingOff());
        console.log(res)
        this.refreshData();
        this.modal.dismiss();
      });

    this.actionsAddLike = this.actionsObj.pipe(filter((res: addLikePostAction) => res.type === Add_Like_Post))
      .subscribe((res) => {
        const index = this.listPostsNormal.findIndex(post => post.post_id===res.post_id);
        this.listPostsNormal[index].cantidadMeGustas = (!this.listPostsNormal[index].cantidadMeGustas) ? 1 : this.listPostsNormal[index].cantidadMeGustas+1;
      });


      

    this.actionsCommentsPost = this.actionsObj.pipe(filter((res: SetCommentsPostAction) => res.type === Set_Comments_Post))
      .subscribe((res) => {
        const index = this.listPostsNormal.findIndex(post => post.post_id===res.post_id);
        if (!this.listPostsNormal[index].comments || this.listPostsNormal[index].comments.length == 0) {
            if(res.typeAdd == "before"){
              this.listPostsNormal[index].cantidadComentarios = (!this.listPostsNormal[index].cantidadComentarios) ? 1 : this.listPostsNormal[index].cantidadComentarios+1;
            }
            this.listPostsNormal[index].comments = res.comments;
        }else{
          if(res.typeAdd == "before"){
            this.listPostsNormal[index].cantidadComentarios = (!this.listPostsNormal[index].cantidadComentarios) ? 1 : this.listPostsNormal[index].cantidadComentarios+1;
            console.log(this.listPostsNormal[index]);
            this.listPostsNormal[index].comments = [...res.comments, ...this.listPostsNormal[index].comments]
          }else if(res.typeAdd == "after"){
            this.listPostsNormal[index].comments = [...this.listPostsNormal[index].comments, ...res.comments];
          }else if(res.typeAdd == "init"){
            this.listPostsNormal[index].comments = res.comments;
          }
        }
      });
  }

  refreshData(){
    this.store.dispatch(new GetShopkeepersCommunityAction(this.user.token, 1, this.refreshContentElement.nativeElement));
  }


  loadInfiniteScroll(event) {
    if (this.maxPaginate >= this.nPagePaginate) {
      this.store.dispatch(new LoadingOn());
      this.store.dispatch(new GetShopkeepersCommunityAction(this.user.token,this.nPagePaginate));
      this.nPagePaginate++;
      event.target.complete();
    }else{
      event.target.disabled = true;
    }
  }
  
  async abrirModalCrearPost() {
    const modal = await this.modalController.create({
      component: ComunidadTenderosCrearPostComponent,
      componentProps: { 
        user: this.user
      }
    });
    return await modal.present();
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

  ngOnDestroy(): void {
    this.actionsCommentsPost.unsubscribe();
    this.authSubscribe.unsubscribe();
    this.shopkeepersCommunitySubscribe.unsubscribe();
    this.actionsAddLike.unsubscribe();
    this.actionsSetCreatePost.unsubscribe();
  }

  ionViewWillEnter() {
    this.actionsSetSurvey = this.actionsObj.pipe(filter((res: SetSurveyAction) => res.type === Set_Survey))
        .subscribe((res) => {
            this.store.dispatch(new LoadingOff());
            const index = this.listSurveys.findIndex(encuesta => encuesta.id === res.encuesta_id);
            this.listSurveys.splice(index, 1);
            this.presentAlert('La encuesta se respondió correctamente');
        });
  }

  ionViewWillLeave() {
    this.actionsSetSurvey.unsubscribe();
  }
}


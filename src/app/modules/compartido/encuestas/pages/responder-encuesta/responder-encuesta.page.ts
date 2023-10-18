import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ISurveys } from 'src/app/interfaces/ISurveys';
import { IUser } from 'src/app/interfaces/IUser';
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SetSurveysAction, Set_Surveys, GetSurveysAction, SetSurveyAction, Set_Survey } from 'src/app/modules/compartido/comunidadTenderos/pages/store/comunidad-tenderos.actions';
import { LoadingOff, LoadingOn } from 'src/app/modules/compartido/general/store/actions/loading.actions';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-responder-encuesta',
  templateUrl: './responder-encuesta.page.html',
  styleUrls: ['./responder-encuesta.page.scss'],
})
export class ResponderEncuestaPage implements OnInit {

  private surveySubscribe = new Subscription();
  private actionsSetSurvey = new Subscription();
  public listSurveys:ISurveys[] = [];
  public user: IUser;
  public encuesta_id: string;
  public notValidateResponse: boolean = false;

  constructor(
    private store: Store<AppState>,
    private actionsObj: ActionsSubject,
    private route: ActivatedRoute,
    private router: Router,
      private alertController: AlertController,
      private navigation: NavigationHelper,
    ) { 
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.encuesta_id = this.router.getCurrentNavigation().extras.state.data.encuesta_id;
          if (this.router.getCurrentNavigation().extras.state.data.notValidateResponse) {
            this.notValidateResponse = this.router.getCurrentNavigation().extras.state.data.notValidateResponse;
          }
        }else{
          return false;
        }
      })
    this.user = this.route.snapshot.data['user'];
  }

  ngOnInit() {
    if (!this.encuesta_id) {
      this.presentAlert("No se encontró ninguna encuesta pendiente");
      setTimeout(() => this.navigation.justBack(), 500);
      return false;
    }
    this.store.dispatch(new LoadingOn());
    this.store.dispatch(new GetSurveysAction(this.user.token, null, this.encuesta_id, "1", this.notValidateResponse));
    this.surveySubscribe = this.actionsObj.pipe(filter((res: SetSurveysAction) => res.type === Set_Surveys))
      .subscribe((res) => {
        // Encuestas
        if (res.survey.data && res.survey.data.length > 0) {
          this.listSurveys = res.survey.data;
        }else{
          this.presentAlert("No se encontró ninguna encuesta pendiente");
          setTimeout(() => this.navigation.justBack(), 500);
        }
        this.store.dispatch(new LoadingOff());
      },(err)=>{
        console.log(err);
      });
    this.actionsSetSurvey = this.actionsObj.pipe(filter((res: SetSurveyAction) => res.type === Set_Survey))
      .subscribe((res) => {
        this.store.dispatch(new LoadingOff());
        const index = this.listSurveys.findIndex(encuesta => encuesta.id===res.encuesta_id);
        this.listSurveys.splice(index,1);
        if (this.listSurveys.length == 0) {
          this.navigation.justBack();
        }
        this.presentAlert("La encuesta se respondió correctamente");
      });
    
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
    this.surveySubscribe.unsubscribe();
    this.actionsSetSurvey.unsubscribe();
  }

}

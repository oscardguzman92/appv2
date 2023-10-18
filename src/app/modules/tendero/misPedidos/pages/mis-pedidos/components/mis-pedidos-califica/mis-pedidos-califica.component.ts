import { Component, OnInit, Input } from '@angular/core';
import { Storage } from '@ionic/storage';
import { OrdersService } from '../../../../../../../services/orders/orders.service';
import { AlertController, ModalController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { LoadingOff, LoadingOn } from 'src/app/modules/compartido/general/store/actions/loading.actions';


@Component({
  selector: 'app-mis-pedidos-califica',
  templateUrl: './mis-pedidos-califica.component.html',
  styleUrls: ['./mis-pedidos-califica.component.scss'],
})
export class MisPedidosCalificaComponent implements OnInit {

  @Input("order") order;
  @Input("motivos") motivos; 
  company : string ="Compañia";
  scoreValue:number=null;
  orderState:string=null;
  score:any=[
    {
      icon:"star-outline"
    },
    {
      icon: "star-outline"
    },
    {
      icon: "star-outline"
    },
    {
      icon: "star-outline"
    },
    {
      icon: "star-outline"
    }
  ];

  public form = []; /*[
    { val: 'Completo', isChecked: false },
    { val: 'Incompleto', isChecked: false },
    { val: 'No llegó', isChecked: false }
  ]; */
  public comment = '';

  activeIcon: string ="md-star";
  nonActiveIcon: string ="star-outline";
  token:string;

  constructor(    
    private store: Store<AppState>,
    private storage: Storage,
    private modal: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    console.log(this.order);
    console.log(this.motivos);
    this.motivos.forEach(motivo => {
      let obj : any = {};
      obj.val = motivo.motivo;
      obj.isChecked = motivo.isChecked;
      this.form.push(obj);
    });
    this.company = this.order.distribuidor;

    this.storage.get('user').then(usu => {
      this.token = JSON.parse(usu).token;
    });
       
  }

  closeModal(){
    this.modal.dismiss();
  }

  setScore(value:number){
    this.scoreValue = value;
    this.printScore(value);
  }
  
  printScore(value){
    this.normalizeScore();
    for (let i = 0; i < value; i++) {
      this.score[i].icon = this.activeIcon;
    }
    //
  }
  
  normalizeScore(){
    for(let i = 0; i < this.score.length; i++){
      this.score[i].icon = this.nonActiveIcon;
    }
  }

  sendScore(){
    let params : any = {
      pedido_id: this.order.id,
      calificacion:this.scoreValue,
      observaciones: "",
      estado_pedido:"",
      token:this.token
    }
    let set = null;
    for(let i = 0 ; i < this.form.length ; i++){
      if (this.form[i].isChecked) {
        params.estado_pedido = this.form[i].val;
        set = true;
      }
    }

    if(this.comment != '') {
      params.observaciones = this.comment; 
    }
    
    if(set && this.scoreValue){
      this.modal.dismiss(params);
    } else if (this.scoreValue==null) {
      this.presentAlert("Seleccione una calificación");
    } else if (!set) {
      this.presentAlert("Seleccione un motivo");
    } 
    //console.log(this.form);
    //console.log(this.order);
  }
  
  normalizeEntry(val:string){
    console.log("click en check",val);
    for (let i = 0; i < this.form.length; i++){
      if (this.form[i].val != val){
        this.form[i].isChecked = false;
      }
    }
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

import { Component, OnInit } from '@angular/core';
//import { DatePicker } from '@ionic-native/date-picker';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { OrdersService } from '../../../../../services/orders/orders.service';
import { AppState } from 'src/app/store/app.reducer';
import { LoadingOff, LoadingOn } from '../../../general/store/actions/loading.actions';
import { Store } from '@ngrx/store';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-extra-ruta',
  templateUrl: './extra-ruta.page.html',
  styleUrls: ['./extra-ruta.page.scss'],
})
export class ExtraRutaPage implements OnInit {

  public data:any={
    pedido_id:"",
    subtotal:"",
    subtotalIva:""
  };
  today=null;
  comment="";
  newSendDate="";

  public comentario:string;
  public fecha:string;
  constructor(
    //private datePicker: DatePicker,
    private route: ActivatedRoute,
    private navigation: NavigationHelper,
    private router: Router,
    private orderService: OrdersService, 
    private store: Store<AppState>,
    public alertController: AlertController,) {
      this.today = this.formatDate(new Date());
      this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.data;
        console.log(this.data);
      }
    });

    }

  ngOnInit() {

  }

  sendExtraRoute(){
    this.store.dispatch(new LoadingOn);
    let params = {
      token : this.data.token,
      pedido_id:this.data.pedido_id,
      observacion:this.comment,
      fecha_envio: this.formatDate(this.newSendDate)
    };
    this.orderService.setDatosExtrasPedido(params).subscribe(success=>{
      this.store.dispatch(new LoadingOff);
      if (success.status=="ok" && success.code=="0"){
        console.log(success);
        this.presentAlert(success.content.mensaje);
      }
      if(this.data.role =="vendedor"){
        this.navigation.goTo("lista-clientes");
        
      }else{
        this.navigation.goTo("inicio-tendero");
      }
    },error=>{
      this.store.dispatch(new LoadingOff);
        this.presentAlert(JSON.stringify(error));
        if(this.data.role =="vendedor"){
          this.navigation.goTo("lista-clientes");
        }else{
          this.navigation.goTo("inicio-tendero");
        }
    });
  }

  justBack(){
    this.navigation.justBack();
  }


  formatDate(date) {
    let d = new Date(date),
      day = '' + d.getDate(),
      month = '' + (d.getMonth() + 1),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    console.log(year);
    console.log(month);
    console.log(day);
    console.log([year, month, day].join('-'));
    return [year, month, day].join('-');
  }

  //alert de pedido 
  async presentAlert(message: string) {
    let buttons: any = ['Aceptar'];
    const alert = await this.alertController.create({
      header: 'Información',
      subHeader: '',
      message: message,
      buttons: buttons
    });
    await alert.present();
  }

}

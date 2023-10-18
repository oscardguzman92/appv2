import { Injectable, OnInit } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';

export interface LocalNotification{
  text:string,
  title:string,
  trigger?: {at: Date},
  led?:string,
  sound?:string,
  data?:any
}

@Injectable({
  providedIn: 'root'
})


export class LocalNotificationService {

  constructor(private localNotifications: LocalNotifications,private navigation:NavigationHelper) {}

  async setLocalNotification(params:LocalNotification){
    if(params.trigger == undefined){
      params.trigger.at = new Date(new Date().getTime() + 1000 * 60 * 30);//30 min
    }
    console.log(params.trigger.at,"params.trigger.at");
    await this.getAll().then(result => {

      if(result.length > 0){
        let r = result.filter(item=>{
          if (item.title.indexOf("pedido pendiente") !== -1 || item.text.indexOf("pedido pendiente") !== -1 ){
            return item;
          }
        });

        if(r.length>0){
          this.clearNotification(r[0].id);
        }
      }
    });

    this.sendLocalNotification(params);
    //alert("acabo de programar noti");
  }
  
  sendLocalNotification(params:LocalNotification){
    return this.localNotifications.schedule(params);
  }

  getAll(){
    return this.localNotifications.getAll();
  }

  clearNotification(id:number){
    this.localNotifications.clear(id);
    console.log("limpio notificacion",id);
  }

  clearAllNotification(){
    console.log("borra todas las notificaciones");
    this.localNotifications.cancelAll();
  }

  async checkReloadNotification(saldo:string){
    await this.getAll().then(result => {
      if (result.length > 0) {
        let r = result.filter(item => {
          if (item.title.indexOf("saldo") !== -1 || item.text.indexOf("saldo") !== -1) {
            return item;
          }
        });
        if (r.length > 0 && parseInt(saldo) >= 30000) {
          this.clearNotification(r[0].id);
        }
      }
    });
  }

  initHandler(){
    //this.localNotifications.on('click', (event, notification, state) => {
    this.localNotifications.on("click").subscribe(res =>{
      console.log(res,"desde init localnotificacion");
      if (res.data.redirect != null && res.data.redirect != undefined){
        this.navigation.goToBack(res.data.redirect);
      }
    });
  }

}

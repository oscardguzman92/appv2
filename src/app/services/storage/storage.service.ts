import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage'
 
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage :Storage ) { }

  getStoredData(key:string){
    //http://192.168.0.12:8000/getDatosSinConexion
    this.storage.get(key).then( success => {
      console.log(key);
      console.log(success);
    });
  }
}

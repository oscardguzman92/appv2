import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
  providedIn: 'root'
})

export class PrinterService {


  constructor(private btSerial:BluetoothSerial) { }

  print(address, content:string){
    return new Promise((resolve, reject) => {
      let xyz=this.connectBT(address).subscribe(data=>{
        console.log(data);
        console.log(content);
          //content = "asd \n linea dos \t tabulador \n nueva linea";
          this.btSerial.write(content).then(dataz=>{
            console.log("WRITE SUCCESS",dataz);
            xyz.unsubscribe();
            resolve(dataz);
          },errx=>{
            reject(errx);
            console.log("WRITE FAILED",errx);
          });
        },err=>{
          console.log("CONNECTION ERROR",err);
          reject(err);
        });
  });
  }


  /* nuevo */

  searchBt()
  {
    return this.btSerial.list();
  }
  isEnabled(){
    return this.btSerial.isEnabled();
  }

  connectBT(address)
  {
    return this.btSerial.connect(address);

  }

}
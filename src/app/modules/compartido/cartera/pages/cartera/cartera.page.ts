import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Shop } from 'src/app/models/Shop';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';

@Component({
  selector: 'app-cartera',
  templateUrl: './cartera.page.html',
  styleUrls: ['./cartera.page.scss'],
})
export class CarteraPage implements OnInit {
  shopData: any;
  shop: Shop;
  role:string;
  shops:any;
  distribuidor:any=[];
  distriImage: any;


  constructor(private router: Router, private navigation: NavigationHelper) {    
    const data = this.router.getCurrentNavigation().extras.state.data;
    if (data.user != undefined && data.user == "cliente"){
      this.role = "cliente";
      if (data.shops.length > 1){
        this.shop = {
          ...data.shops[0], ...data.shops[0].tiendas_distribuidores[0]};
        this.shops = data.shops;
        console.log([this.shops,this.shop,"es cliente y tiene mas de una tienaa"]);
        this.setDistribuidor();
      }else{
        this.shops = data.shops; 
        this.shop = data.shops[0];
        this.setDistribuidor();
        console.log(this.shop,"json");
        // let temp = {
        //   id: data.shops[0].tiendas_distribuidores[0].id,
        //   nombre: data.shops[0].tiendas_distribuidores[0].nombre,
        //   active: true
        // };
        // this.distribuidor.push(temp);
      }
    }else{
      this.role = "vendedor";
      this.shop = data;
      let temp = {
        id: 0,
        nombre: "",
        active: true
      };
      this.distribuidor.push(temp);
    }
  }   

  ngOnInit() {
  }

  getMora() {
    let split = (this.shop.saldo !== null) ? this.shop.saldo.split('[') : [];
    let r: any = {
      saldo: 0,
      mora: 0
    }
    r.saldo = split[0];
    if (split.length > 1) {
      r.mora = split[1].replace("]", "");
    }
    return r.mora;
  }

  getSaldo(returnAll?) {
    //console.log(this.shop,"antes que se rompa");
    if(this.shop.saldo == undefined){
      let a:any = this.shop;
      this.shop = { ...this.shop, ...a.tiendas_distribuidores[0]};
    }
    //console.log(this.shop,"merge");
    let split = (this.shop.saldo !== null) ? this.shop.saldo.split('[') : [];
    let r: any = {
      saldo: 0,
      mora: 0
    }
    r.saldo = split[0];
    if (split.length > 1) {
      r.mora = split[1].replace("]", "");
    }
    if(returnAll){
      return r;
    }
    return r.saldo;
  }

  getSaldoDisponible(){
    //console.log("z");
    let saldo = this.getSaldo(true);
    let cupo = this.getCupo();
    let r = +saldo.saldo + +saldo.mora;
    if (parseInt(cupo) != null && parseInt(cupo) >= r ){
      return parseInt(cupo)- r;
    }
    return 0;
  }

  getCupo(){
    console.log(this.shop,"???");
    return (this.shop.cupo_credito) ? this.shop.cupo_credito:"0";
  }

  justBack() {
    this.navigation.justBack();
  }

  
  getDistriActive(){
    let find = this.distribuidor.filter( temp =>{
      
      if(temp.active){
        return true;
      }
    });
    if(find){
      return find;
    }
    return {id:0,nombre:""}
  }

  onChangeShop(tiendaId){
    console.log("change shop");
    let distri = this.getDistriActive();
    console.log(distri);
    let r = this.shops.filter(temp =>{ 
      if(temp.id == tiendaId ){
        let distritemp = temp.tiendas_distribuidores.filter(dTemp=>{
          if(dTemp.nombre == distri.nombre){
            return true;
          }
        });

        console.log(distritemp, "distritemp");
        if (distritemp != undefined && distritemp.length > 0) {
          console.log("encontro distribuidor en tienda");
          return true;
        }
        console.log("no encontro distribuidor en tienda");
        return false;
      }
    });
    console.log(r,"lo que encontro");
    if(r.length > 0){
      this.shop = { ...r[0], ...r[0].tiendas_distribuidores[0]};
    }else{
      console.log("dejar vacio la tienda");
    }
  }

  onChangeDistri(distri){
    console.log(distri,"distri");
    this.clearDistriActive(distri);
    this.distriImage = this.getDistriImage();
    
    let r = this.shops.filter(temp => {
      let tienda = temp.tiendas_distribuidores.filter( tempT =>{
        if(tempT.id == distri){
          return true;
        }
      });
      if(tienda.length > 0){
        return true
      }
    });
    console.log(r, "lo que encontro distri");
    if (r.length > 0) {
      let distriParams = r[0].tiendas_distribuidores.filter(fil =>{
        if(fil.id == distri){
          return true;
        }
      });
      this.shop = { ...r[0], ...distriParams[0] };
    } else {
      console.log("dejar vacio la tienda");
    }
  }

  getDistriImage(): any {
    let activ = this.getDistriActive();
    console.log(activ,"distri activo");
    if(activ[0].nombre != ""){
      let nombre = activ[0].nombre.toLowerCase(); 
      nombre = nombre.replace(' ',"-");
     
      return `/assets/images/logos-companias/logo-${nombre}-color.jpg`;
    }
  }

  clearDistriActive(distri){
    this.distribuidor.forEach(element => {
      if(element.id == distri){
        element.active = true;
      }else{
        element.active = false;
      }
    });
  }

  setDistribuidor(){
    console.log(this.shops,"adsfjkadsñjflad");
    this.shops.forEach(shop => {
      shop.tiendas_distribuidores.forEach(ele => {
        let temp = {
          id: 0,
          nombre: "",
          active: false
        };
        //si no hay distri
        if (this.distribuidor.length == 0) {
          temp.id = ele.id;
          temp.nombre = ele.nombre;
          temp.active = true;
          this.distribuidor.push(temp);
          console.log(this.distribuidor, "uno");
        } else {
          let exist = this.distribuidor.filter(obj => {
            console.log(obj.id,ele.id,"otros distribuidores");
            if (obj.id != ele.id) {
              return true
            }
          });
          console.log(exist,"otros distribuidores");
          if (exist.length > 0) {
            temp.id = ele.id;
            temp.nombre = ele.nombre;
            this.distribuidor.push(temp);
            console.log(this.distribuidor, "mas de uno");
          }
        }
      });
    });
    this.getDistriImage();
  }
}

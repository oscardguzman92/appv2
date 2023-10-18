import { isArray } from 'util';
import { Injectable } from '@angular/core';
import { ShopSingletonService } from 'src/app/services/shops/shop-singleton.service';


@Injectable({
  providedIn: 'root'
})
export class SpecialOffersService {

  public product: any;
    public mesures:any = {
      "unidad":true,
      "peso":false 
    };
    public short_mesures:any = {
        "unidad":"Und",
        "peso": "Kg" 
    };
    public mesure_choosen =  "Und";
  cumpleDescuento: boolean;

  constructor(private shopSingletonService: ShopSingletonService) { }

  //esta
  aplicarReglas(): any {
      let reglas = [];
      let descuento:any = 0;
      if (this.product.es_ofe_especial  && this.product.reglas_ofe && this.product.reglas_ofe.length > 0) {
          reglas = this.product.reglas_ofe;
      } else if (this.product.es_ofe_especial && this.product.ofertas_reglas && this.product.ofertas_reglas[0] &&
          this.product.ofertas_reglas[0].reglas && this.product.ofertas_reglas[0].reglas.length > 0) {
          reglas = this.product.ofertas_reglas[0].reglas;
      }

      reglas.sort( this.compare );

      for (const regla of reglas) {
          const apply = this.aplicarDescuento(regla, descuento);
          if(apply && isArray.apply && apply.length > 0){
            const continueReglas = apply[0];
            descuento = apply[1];
            if (!continueReglas) {
                break;
            }
          }
      }
      return descuento;
  }

 

  //esta
  private aplicarDescuento(regla?, descuento = 0) {
      if (!regla) {
          return [true, descuento];
      }
      if (regla.tipo_oferta == 'escala') {
          if (!this.validateEscala(regla)) {
              this.cumpleDescuento = false;
              return [true, descuento];
          }

          if (regla.descuento_tipo == 'dinero') {
              this.cumpleDescuento = true;
              descuento += +regla.valor;
          }

          if (regla.descuento_tipo == 'porcentaje') {
              if (regla.aplica == 'totalCompra') {
                  let shop = this.shopSingletonService.getSelectedShop(), total = 0;
                  const products = Object.values(shop.productos_seleccionados);
                  const dis = this.product.distribuidor_id;
                  products.forEach(function (product: any) {
                      if (product.total > 0 && product.distribuidor_id == dis) {
                          total += (product.cantidad * product.precio_unitario);
                      }
                  });

                  this.cumpleDescuento = true;
                  descuento += (+total - (regla.cadena ? descuento : 0)) * +regla.valor;
              }

              if (regla.aplica == 'referencia') {
                  this.cumpleDescuento = true;
                  const valor = (this.product.cantidad * this.product.precio_unitario) - (regla.cadena ? descuento : 0);
                  descuento += valor * +regla.valor;
              }
          }

          return [!regla.oferta_unica, descuento];
      }

      if (regla.tipo_oferta == 'lista-precio') {
          if (!this.validateEscala(regla)) {
              this.cumpleDescuento = false;
              this.product.lista_precio_id_add = null;
              this.product.regla_apply = null;
              return [true, descuento];
          }

          if (regla.descuento_tipo == 'dinero') {
              this.cumpleDescuento = true;
              descuento += (+this.product.precio_unitario - (+regla.valor)) * this.product.cantidad;
              this.product.lista_precio_id_add = regla.lista_precio_id_add;
              this.product.regla_apply = JSON.stringify(regla);
          }

          return [!regla.oferta_unica, descuento];
      }

      if (regla.tipo_oferta == 'lineal') {
          if (regla.descuento_tipo == 'dinero') {
              descuento += (+regla.valor * +this.product.cantidad);
          }

          if (regla.descuento_tipo == 'porcentaje') {
              this.cumpleDescuento = true;
              const valor = (this.product.cantidad * this.product.precio_unitario) - (regla.cadena ? descuento : 0);
              descuento +=  valor * +regla.valor;
          }

          return [!regla.oferta_unica, descuento];
      }

      if (regla.tipo_oferta == 'producto') {
          if (!this.validateEscala(regla)) {
              this.cumpleDescuento = this.cumpleDescuento === true;
              return false;
          }

          this.cumpleDescuento = true;
      }
  }

  //esta
  private validateEscala(regla) {
      if (regla.parametro == 'mayor') {
          if (this.product.cantidad <= regla.cantidad){
              return false;
          }
          return true;
      }

      if (regla.parametro == 'mayorIgual') {
          if (this.product.cantidad < regla.cantidad){
              return false;
          }
          return true;
      }

      return false;
  }


  //esta
  public changeActiveMesure(medida){
      
    //   Object.keys(this.mesures).forEach( (element, index) => {
    //       this.mesures[element] = false;
    //   } );
      
    //   this.mesures[medida] = true;
      this.mesure_choosen = this.short_mesures[medida];
      this.product.unidad_seleccionada = this.getMesureName(this.mesure_choosen);
      //this.saveProduct();
      return [this.product,this.mesures,this.mesure_choosen];
  }

  //esta
  public getMesureName(mesure){

      const m = {
          "k": "KILO",
          "u": "UNID",
      }
      return m[mesure.charAt(0).toLowerCase()];
  }

  //esta
  public aplicar_unidadmedida(){
      if(this.product.factor){
          //pendiente seguir
      }
  }

  //esta
  compare( a, b ) {
      if ( a.prioridad < b.prioridad ){
        return -1;
      }
      if ( a.prioridad > b.prioridad ){
        return 1;
      }
      return 0;
  }
}

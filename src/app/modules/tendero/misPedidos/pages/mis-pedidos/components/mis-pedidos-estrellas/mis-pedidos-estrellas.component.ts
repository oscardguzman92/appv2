import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-mis-pedidos-estrellas',
  templateUrl: './mis-pedidos-estrellas.component.html',
  styleUrls: ['./mis-pedidos-estrellas.component.scss'],
})
export class MisPedidosEstrellasComponent implements OnInit {

  @Input() calificacion : string;
  public template;
  constructor(private sanitizer: DomSanitizer) {
    console.log(this.calificacion);
  }
  
  
  ngOnInit() {
    if(!this.calificacion){
      console.log("no cogio la clifica");
      this.calificacion = "5";
    }
    console.log("init",this.calificacion);
    let templates = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= parseInt(this.calificacion)) {
        //console.log("selected");
        templates = templates + '<ion-icon name="md-star" class="star selected"></ion-icon>' ;
      } else {
        //console.log("no selected");
        templates = templates + '<ion-icon name="star-outline" class="star"></ion-icon>';
      }
    }
    this.template = this.sanitizer.bypassSecurityTrustHtml(templates);
  }

}

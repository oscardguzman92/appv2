import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta-categoria',
  templateUrl: './tarjeta-categoria.component.html',
  styleUrls: ['./tarjeta-categoria.component.scss'],
})
export class TarjetaCategoriaComponent implements OnInit {
  @Input() category: any;

  constructor() { }

  ngOnInit() {}

}

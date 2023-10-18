import { Component, OnInit, Input } from '@angular/core';
import { IClient } from '../../../../../../interfaces/ICashRegisterSale';

@Component({
  selector: 'app-tarjeta-cliente',
  templateUrl: './tarjeta-cliente.component.html',
  styleUrls: ['./tarjeta-cliente.component.scss'],
})
export class TarjetaClienteComponent implements OnInit {
  @Input() client: IClient;

  constructor() { }

  ngOnInit() {}

}

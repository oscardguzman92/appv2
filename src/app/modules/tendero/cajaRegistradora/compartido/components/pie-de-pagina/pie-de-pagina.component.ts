import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pie-de-pagina',
  templateUrl: './pie-de-pagina.component.html',
  styleUrls: ['./pie-de-pagina.component.scss'],
})
export class PieDePaginaComponent implements OnInit {

  @Input() textButton: string;
  @Input() textHighlighted: string;
  @Input() textInfo: string;
  @Output() eventHandlerFooter = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  eventFooter() {
      this.eventHandlerFooter.emit();
  }


}

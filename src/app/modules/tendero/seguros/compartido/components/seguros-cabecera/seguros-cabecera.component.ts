import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { AppState } from '../../../../../../store/app.reducer';
import { ToggleMenu } from '../../../../../compartido/general/store/actions/menu.actions';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';

@Component({
  selector: 'app-seguros-cabecera',
  templateUrl: './seguros-cabecera.component.html',
  styleUrls: ['./seguros-cabecera.component.scss'],
})

export class SegurosCabeceraComponent implements OnInit {

  @Input() showBackButton: boolean;
  @Input() showTitle: boolean;
  @Input() showBackHomeButton: boolean;
  @Input() showMenuButton: boolean;
  @Input() title: string;
  @Input() subtitle: string;


  constructor(
    private store: Store<AppState>,
    public location: Location,
    private navigation: NavigationHelper,
  ) {
  }

  ngOnInit() {
  }

  toggleMenu() {
    this.store.dispatch(new ToggleMenu());
  }

  justBack() {
    this.location.back();
  }

  goToHome() {
    this.navigation.goTo('seguros-home');
  }

}

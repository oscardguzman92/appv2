import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { IInsurances } from 'src/app/interfaces/IInsurances';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-seguros-mas-info-modal',
  templateUrl: './seguros-mas-info-modal.component.html',
  styleUrls: ['./seguros-mas-info-modal.component.scss'],
})
export class SegurosMasInfoModalComponent implements OnInit {
  @Input() insurance: IInsurances;
  constructor(
    public navigation: NavigationHelper,
    private modalController: ModalController,
    private analyticsService: AnalyticsService

  ) { }

  ngOnInit() {
    console.log(this.insurance,"datos del seguro elejido");
  }

  goToInsuranceRegister( ) {
    if (this.insurance.slug == "vida_voluntario") {
      this.analyticsService.sendEvent('seguros', { 'event_category': 'seguros', 'event_label': 'register_seguros_vida' });
    } else {
      this.analyticsService.sendEvent('seguros', { 'event_category': 'seguros', 'event_label': 'register_seguros_pyme' });
    }
    this.navigation.goToBack('seguros-registro', { insurance: this.insurance } );
    this.modalController.dismiss();
  }
}

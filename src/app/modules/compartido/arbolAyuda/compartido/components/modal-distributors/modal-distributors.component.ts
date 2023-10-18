import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';
import { IUser } from 'src/app/interfaces/IUser';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LoadingOn } from '../../../../../compartido/general/store/actions/loading.actions';
import { IDistributors } from '../../../../../../interfaces/IDistributors';

import {
  HelpTreeDistributorsState,
  HelpTreeDistributorsCompleteState
} from './../../../store/help-tree.reducer';

import {
  HelpTreeDistributorsAction,
} from './../../../store/help-tree.actions';

@Component({
  selector: 'app-modal-distributors',
  templateUrl: './modal-distributors.component.html',
  styleUrls: ['./modal-distributors.component.scss'],
})
export class ModalDistributorsComponent implements OnInit, OnDestroy {

  public user: IUser;
  public distributors: IDistributors[];
  public subscriptionHelpTreeDistributors = new Subscription();

  constructor(
    private storage: Storage,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private storeHelpTreeDistributors: Store<HelpTreeDistributorsState>,
    private storeHelpTreeDistributorsComplete: Store<HelpTreeDistributorsCompleteState>
    ) { }

  ngOnInit() {
    this.configureDistributos();
  }

  close() {
    this.modalController.dismiss();
  }

  configureDistributos() {
    this.dataTree();
    this.subscriptionHelpTreeDistributors = this.storeHelpTreeDistributorsComplete
      .select('HelpTreeDistributorsComplete')
      .subscribe(response => {
        if (response.active) {
         this.distributors = response.distributors;
        }
      });
  }

  dataTree() {
    this.storage.get('HelpTreeDistributors').then(response => {
      if (response === null) {

        this.storage.get('user').then(data => {
          this.user = JSON.parse(data);
          const HelpTreeDistributors = new HelpTreeDistributorsAction(true, this.user.token);
          this.storeHelpTreeDistributors.dispatch(HelpTreeDistributors);
          this.storeHelpTreeDistributors.dispatch(new LoadingOn());
        });

      }
    });
  }

  openWhatsapp(phone, nombre) {
    window.open('https://api.whatsapp.com/send?text=Hola ' + nombre + '&phone=+57' + phone , '_blank');
  }

  ngOnDestroy(): void {
    this.subscriptionHelpTreeDistributors.unsubscribe();
  }


}

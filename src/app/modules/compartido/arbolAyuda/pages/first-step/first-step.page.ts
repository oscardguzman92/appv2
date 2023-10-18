import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IonSlides, Platform } from '@ionic/angular';

import { IOption, ITag, IRedirect, IHelpTree } from '../../../../../interfaces/IHelpTree';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IUser } from '../../../../../interfaces/IUser';
import { LoadingOn } from '../../../../compartido/general/store/actions/loading.actions';

import {Intercom} from '@ionic-native/intercom/ngx';

import {
  HelpTreeState,
  HelpTreeCompleteState
} from './../../store/help-tree.reducer';

import {
  HelpTreeAction,
} from './../../store/help-tree.actions';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.page.html',
  styleUrls: ['./first-step.page.scss'],
})
export class FirstStepPage implements OnInit, OnDestroy {

  public inSearch: boolean;
  public user: IUser;
  public titleHeader: string;
  public activeStep: string;
  public helpTreeElements: IHelpTree[];
  public subscriptionHelpTree = new Subscription();

  constructor(
    public navigation: NavigationHelper,
    private storeHelpTree: Store<HelpTreeState>,
    private storeHelpTreeComplete: Store<HelpTreeCompleteState>,
    private storage: Storage,
    private intercom: Intercom,
    private platform: Platform
  ) {

   }

  ngOnInit() {
    this.configureInit();
    this.configureThree();
  }

  ionViewDidEnter() {
    this.configureThree();
  }

  configureInit() {
    this.titleHeader = 'Centro de ayuda';
    this.activeStep = 'step-one';
  }
  
  dataTree() {
    this.storage.get('HelpTree').then(response => {
      if (response === null) {

        this.storage.get('user').then(data => {
          this.user = JSON.parse(data);
          const HelpTree = new HelpTreeAction(true, this.user.token, this.user.role);
          this.storeHelpTree.dispatch(HelpTree);
          this.storeHelpTree.dispatch(new LoadingOn());
        });

      }
    });
  }

  configureThree() {

    this.dataTree();
    this.subscriptionHelpTree = this.storeHelpTreeComplete
      .select('HelpTreeComplete')
      .subscribe(response => {
        if (response.active) {
          this.helpTreeElements = response.helpTreeElement.children;
        }
      });
  }

  search( searchString: string ) {
    console.log('searchString', searchString);
   const helpTreeElements = this.helpTreeElements.filter(helpTreeElement => {
        return helpTreeElement.description.toLowerCase().indexOf(searchString.toLowerCase()) !== -1;
    });
    console.log('helpTreeElement', helpTreeElements);

    if ( helpTreeElements.length > 0 ) {
      this.inSearch = true;
      this.helpTreeElements = helpTreeElements;
      if (helpTreeElements.length === 1) {
        this.goToSecondStep( helpTreeElements[0].children );
      }
    }
  }

  goToSecondStep(helpTreeElement: IHelpTree[]) {
    if ( helpTreeElement !== undefined ) {
      this.navigation.goToBack('second-step', helpTreeElement );
    }
}

  ngOnDestroy(): void {
    this.subscriptionHelpTree.unsubscribe();
  }

  ionViewDidLeave() {
      this.subscriptionHelpTree.unsubscribe();
  }
  
  openChat() {
      this.intercom.displayMessenger();
  }

}

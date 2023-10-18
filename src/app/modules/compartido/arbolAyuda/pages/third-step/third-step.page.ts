import { Component, OnInit } from '@angular/core';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IHelpTree } from '../../../../../interfaces/IHelpTree';

@Component({
  selector: 'app-third-step',
  templateUrl: './third-step.page.html',
  styleUrls: ['./third-step.page.scss'],
})
export class ThirdStepPage implements OnInit {
  public helpTreeElements: IHelpTree[];
  public activeStep: string;
  public titleHeader: string;

  constructor(
    public navigation: NavigationHelper
  ) { }

  ngOnInit() {
    this.configureInit();
  }

  configureInit() {
    this.titleHeader = 'Centro de ayuda';
    this.activeStep = 'step-three';
    this.helpTreeElements = this.navigation.params.state.data;
  }

  goToFirstStep() {
    this.navigation.goTo('first-step');
  }


}

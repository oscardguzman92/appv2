import { Component, OnInit } from '@angular/core';
import { NavigationHelper } from '../../../../../helpers/navigation/navigation.helper';
import { IHelpTree } from '../../../../../interfaces/IHelpTree';

@Component({
  selector: 'app-second-step',
  templateUrl: './second-step.page.html',
  styleUrls: ['./second-step.page.scss'],
})
export class SecondStepPage implements OnInit {
  public helpTreeElements: IHelpTree[];
  public activeStep: string;
  public titleHeader: string;

  constructor(
    public navigation: NavigationHelper,
  ) { }

  ngOnInit() {
    this.configureInit();
  }

  configureInit() {
    this.titleHeader = 'Centro de ayuda';
    this.activeStep = 'step-two';
    this.helpTreeElements = this.navigation.params.state.data;
  }

}

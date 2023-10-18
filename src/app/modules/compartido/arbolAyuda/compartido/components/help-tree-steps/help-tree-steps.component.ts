import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-tree-steps',
  templateUrl: './help-tree-steps.component.html',
  styleUrls: ['./help-tree-steps.component.scss'],
})
export class HelpTreeStepsComponent implements OnInit {
  @Input() activeStep: string;

  constructor() { }

  ngOnInit() {}

}

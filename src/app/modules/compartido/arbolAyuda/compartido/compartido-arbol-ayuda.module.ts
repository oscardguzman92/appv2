import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpTreeHeaderComponent } from './components/help-tree-header/help-tree-header.component';
import { HelpTreeSeekerComponent } from './components/help-tree-seeker/help-tree-seeker.component';
import { HelpTreeStepsComponent } from './components/help-tree-steps/help-tree-steps.component';
import { HelpTreeFirstTagComponent } from './components/help-tree-first-tag/help-tree-first-tag.component';
import { HelpTreeSecondTagComponent } from './components/help-tree-second-tag/help-tree-second-tag.component';
import { HelpTreeThirdTagComponent } from './components/help-tree-third-tag/help-tree-third-tag.component';
import { ModalDistributorsComponent } from './components/modal-distributors/modal-distributors.component';
import {IonicModule} from '@ionic/angular';

@NgModule({
    declarations: [
        HelpTreeHeaderComponent,
        HelpTreeSeekerComponent,
        HelpTreeStepsComponent,
        HelpTreeFirstTagComponent,
        HelpTreeSecondTagComponent,
        HelpTreeThirdTagComponent,
        ModalDistributorsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        HelpTreeHeaderComponent,
        HelpTreeSeekerComponent,
        HelpTreeStepsComponent,
        HelpTreeFirstTagComponent,
        HelpTreeSecondTagComponent,
        HelpTreeThirdTagComponent,
        ModalDistributorsComponent
    ],
    entryComponents: [
        HelpTreeHeaderComponent,
        HelpTreeSeekerComponent,
        HelpTreeStepsComponent,
        HelpTreeFirstTagComponent,
        HelpTreeSecondTagComponent,
        HelpTreeThirdTagComponent,
        ModalDistributorsComponent
    ]
})
export class CompartidoArbolAyudaModule { }


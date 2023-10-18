import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { IUser } from 'src/app/interfaces/IUser';
import { IHelpTree } from '../../../../../../interfaces/IHelpTree';
import { HelpTreeClickState } from './../../../store/help-tree.reducer';
import { HelpTreeClickAction } from './../../../store/help-tree.actions';

@Component({
  selector: 'app-help-tree-second-tag',
  templateUrl: './help-tree-second-tag.component.html',
  styleUrls: ['./help-tree-second-tag.component.scss'],
})
export class HelpTreeSecondTagComponent implements OnInit {

  @Input() helpTreeElement: IHelpTree;
  public user: IUser;

  constructor(
    public navigation: NavigationHelper,
    private storeHelpTreeClick: Store<HelpTreeClickState>,
    private storage: Storage,

  ) { }

  ngOnInit() {
  }

  goToThirdStep(helpTreeElement: IHelpTree[]) {
    if ( helpTreeElement !== undefined ) {
      this.storage.get('user').then(data => {

        this.user = JSON.parse(data);

        const HelpTreeClick = new HelpTreeClickAction(true, this.user.token, this.helpTreeElement._id, 'option');
        this.storeHelpTreeClick.dispatch(HelpTreeClick);
        this.navigation.goToBack('third-step', helpTreeElement );

      });

    }
  }


}

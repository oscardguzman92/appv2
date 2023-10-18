import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { NavigationHelper } from '../../../../../../helpers/navigation/navigation.helper';
import { IUser } from 'src/app/interfaces/IUser';
import { IHelpTree } from '../../../../../../interfaces/IHelpTree';
import { HelpTreeClickState } from './../../../store/help-tree.reducer';
import { HelpTreeClickAction } from './../../../store/help-tree.actions';


@Component({
  selector: 'app-help-tree-first-tag',
  templateUrl: './help-tree-first-tag.component.html',
  styleUrls: ['./help-tree-first-tag.component.scss'],
})
export class HelpTreeFirstTagComponent implements OnInit {

  @Input() helpTreeElement: IHelpTree;
  public user: IUser;

  constructor(
    public navigation: NavigationHelper,
    private storeHelpTreeClick: Store<HelpTreeClickState>,
    private storage: Storage,

  ) { }

  ngOnInit() {
  }

  goToSecondStep(helpTreeElement: IHelpTree[]) {
      if ( helpTreeElement !== undefined ) {
        this.storage.get('user').then(data => {

          this.user = JSON.parse(data);
          const HelpTreeClick = new HelpTreeClickAction(true, this.user.token, this.helpTreeElement._id, 'tag');
          this.storeHelpTreeClick.dispatch(HelpTreeClick);
          this.navigation.goToBack('second-step', helpTreeElement );

        });

      }
  }


}

import {Component, OnInit, Output, EventEmitter, ViewChild, Input} from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-help-tree-seeker',
  templateUrl: './help-tree-seeker.component.html',
  styleUrls: ['./help-tree-seeker.component.scss'],
})
export class HelpTreeSeekerComponent implements OnInit {

  @Output() eventSearch: EventEmitter<string> = new EventEmitter<string>();
  @Input() inSearch: boolean;
  @ViewChild('search') searchElement: any ;

  public showContact: boolean;
  public small: boolean;
  public searchModel: string;
  public txtSearch: string;
  public txtSearchTemp: string;
  public statusSize: boolean;
  public inputExpand: boolean;
  public activeKeyUp: boolean;

  constructor(
      private keyboard: Keyboard
      ) {
      this.small = true;
      this.statusSize = true;

  }

  ngOnInit() {
    this.inputExpand = true;
    this.activeKeyUp = true;
  }


  keyup(e) {
    if ( e.target.value.length > 15 ) {
      this.eventSearch.emit(e.target.value);
    }
  }

  showSearch() {
      this.small = false;
      this.showContact = false;
      this.txtSearch = this.txtSearchTemp;
      this.statusSize = this.small;
  }

  hideSearch(clearInput?: boolean) {
      this.keyboard.hide();
      this.small = true;
      this.showContact = true;
      this.txtSearchTemp = (clearInput) ? '' : this.txtSearch;
      setTimeout(() => this.statusSize = this.small, 500);
  }

  emitFocusEvent() {
  }

  emitBlurEvent() {
  }
  onEnter() {
    this.eventSearch.emit(this.txtSearch);
    this.txtSearch = '';
  }
  hideSearchIcon(e) {
      this.eventSearch.emit(this.txtSearch);
      this.txtSearch = '';
  }

}

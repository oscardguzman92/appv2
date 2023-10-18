import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { SetLikePostAction, GetCommentsPostAction, SetCommentsPostAction, Set_Comments_Post, CreateCommentPostAction } from '../../../store/comunidad-tenderos.actions';
import { IUser } from 'src/app/interfaces/IUser';
import { IShopkeepersCommunity } from 'src/app/interfaces/IShopkeepersCommunity';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompaniesPortfolioShopkeeperService } from 'src/app/services/orders/companies-portfolio-shopkeeper.service';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-comunidad-tenderos-post-normal',
  templateUrl: './comunidad-tenderos-post-normal.component.html',
  styleUrls: ['./comunidad-tenderos-post-normal.component.scss'],
})
export class ComunidadTenderosPostNormalComponent implements OnInit {

  @Input() post: IShopkeepersCommunity;
  @Input() user: IUser;
  public formComment: FormGroup;
  public formData: FormGroup;
  public statusListComment:boolean = false;
  public statusWriteComment:boolean = false;
  public newTextComment:string = "";

  constructor(
    private sanitizer: DomSanitizer,
    private store: Store<AppState>,
    private actionsObj: ActionsSubject,
    private companiesPortfolioShopkeeperService: CompaniesPortfolioShopkeeperService,
    public apiService: ApiService,
    private formBuilder: FormBuilder) { 
      this.formComment = this.formBuilder.group({
        comment: ['', []]
      });
  }

  ngOnInit() {
    if (this.post.medias && this.post.medias.length > 0 && this.post.medias[0].type == 'video' && this.post.medias[0].url) {
      this.post.medias[0].url = this.sanitizer.bypassSecurityTrustResourceUrl(this.post.medias[0].url);
    }
  }
  

  addLike(){
    if (!this.post.meGustaUsuario) {
      this.store.dispatch(new SetLikePostAction(this.user.token, this.post.post_id));
      this.post.meGustaUsuario = true;
    }
  }

  getComments(){
    if (!this.statusListComment) {
      this.store.dispatch(new GetCommentsPostAction(this.user.token, this.post.post_id, 1));
    }
    this.statusListComment = !this.statusListComment;
  }

  showWriteComment(){
    this.statusWriteComment = true;
  }

  createComment(){
    if (this.formComment.value.comment != "") {
      this.store.dispatch(new CreateCommentPostAction(this.user, this.formComment.value.comment, this.post.post_id, this.post.user_id));
      this.formComment.value.comment = "";
      setTimeout(() => this.statusWriteComment = false,400);
    }
  }

  

}

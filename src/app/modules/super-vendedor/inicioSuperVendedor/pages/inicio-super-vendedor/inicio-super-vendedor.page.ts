import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IUser } from 'src/app/interfaces/IUser';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelper } from 'src/app/helpers/navigation/navigation.helper';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SetSellersAction, SET_SELLERS, GetSellersAction, GetShopkeeperBySellerAction, SET_SHOPKEEPER_BY_SELLER, SetShopkeeperBySellerAction } from '../../store/superSeller.actions';
import { filter } from 'rxjs/operators';
import { AppState } from 'src/app/store/app.reducer';
import { Storage } from '@ionic/storage';
import { UserBuilder } from 'src/app/builders/user.builder';
import { Menu } from 'src/app/models/Menu';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';

@Component({
  selector: 'app-inicio-super-vendedor',
  templateUrl: './inicio-super-vendedor.page.html',
  styleUrls: ['./inicio-super-vendedor.page.scss'],
})
export class InicioSuperVendedorPage implements OnInit {

  public user: any;
  private sellersSubs = new Subscription();
  private getShopsSubs = new Subscription();
  
  public sellers:any[] = [];

  @ViewChild('refreshElement', {read: ElementRef}) refreshElement: ElementRef;
  
  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private navigation: NavigationHelper,
    private actionsSubj: ActionsSubject,
    private store: Store<AppState>,
    private superSellerService: SuperSellerService,
  ) {
    this.user = this.route.snapshot.data['user'];
  }
    
  ngOnInit() {
    this.sellersSubs = this.actionsSubj
      .pipe(filter(res => res.type === SET_SELLERS))
      .subscribe((res: SetSellersAction) => {
        this.sellers = res.sellers;
      });

    this.getShopsSubs = this.actionsSubj
      .pipe(filter(res => res.type === SET_SHOPKEEPER_BY_SELLER))
      .subscribe((res: SetShopkeeperBySellerAction) => {
        this.storage.set('userSuperSellerTemp', JSON.stringify(this.user)).then(()=>{
          const userBuild = new UserBuilder(res.user);
          this.user = userBuild.getUser();
          this.storage.set('user', JSON.stringify(this.user)).then(()=>{
            this.navigation.goToBack('lista-clientes');
          });
        });
      });

    this.storage.get('userSuperSellerTemp').then((user)=> {
      if (user) {
        user  = JSON.parse(user);
        this.user = user;
      }
      this.store.dispatch(new GetSellersAction(this.user.token));
    })
  }

  ionViewWillEnter() {
    this.storage.get('userSuperSellerTemp').then((user)=>{
      if (user) {
        this.user = JSON.parse(user);
      }else{
        this.superSellerService.idSuperSeller = this.user.super_vendedor_id;
      }
    })
  }

  goToMyShopkeepers(seller)
  {
    this.store.dispatch(new GetShopkeeperBySellerAction(this.user.token, seller.cedula));
  }

  refreshData()
  {
    this.store.dispatch(new GetSellersAction(this.user.token, this.refreshElement.nativeElement));
  }



  ngOnDestroy() {
    this.getShopsSubs.unsubscribe();
    this.sellersSubs.unsubscribe();
  }

}

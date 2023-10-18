import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UserSellerService {

  public searchAllDays: boolean = false;
  constructor(
    private storage: Storage,
  ) { }

  setSearchAllDays(searchAllDays) {
    this.searchAllDays = searchAllDays;
    this.storage.set("searchAllDays", this.searchAllDays);
  }

  async getSearchAllDays() {
    return this.searchAllDays = await this.storage.get("searchAllDays") || false;
  }
}

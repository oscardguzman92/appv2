import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../../store/app.reducer';
import {filter, take} from 'rxjs/operators';
import {LoadingController, ModalController, NavController} from '@ionic/angular';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-general-loading',
    template: '<span></span>',
})
export class GeneralLoadingComponent implements OnInit {
    private loadingSubs = new Subscription();
    private withDuration = true;

    constructor(
        private store: Store<AppState>,
        private loadingController: LoadingController) {
    }

    ngOnInit() {
        this.loadingSubs = this.store.select('loading')
            .pipe(
                filter(loading => loading.on !== null)
            ).subscribe(res => {
                this.withDuration = (!res.withoutDuration);
                if (res.on && !res.loadingOffer) {
                    this.createLoading();
                    return;
                }

                if (res.on && res.loadingOffer) {
                    this.createLoadingOffer();
                    return;
                }

                this.loadingController.getTop().then(loading => {
                    if (loading) {
                        setTimeout(() => {
                            this.loadingController.dismiss()
                                .catch(res => {
                                    console.log(res);
                                });
                        }, 500);
                    }
                });
            });
    }

    private async createLoading() {
        const params = (this.withDuration) ?
            { message: '', cssClass: 'loading-modal', duration: 12000 } : { message: '', cssClass: 'loading-modal'};

        const loading = await this.loadingController.create(params);

        return await loading.present();
    }

    private async createLoadingOffer() {
        const params = (this.withDuration) ?
            { message: '', cssClass: 'loading-modal-offer', duration: 12000 } : { message: '', cssClass: 'loading-modal-offer'};

        const loading = await this.loadingController.create(params);

        return await loading.present();
    }

}

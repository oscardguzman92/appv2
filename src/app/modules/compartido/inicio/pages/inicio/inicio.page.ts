import {Component, OnInit} from '@angular/core';
import {InicioValidacionCedulaComponent} from './components/inicio-validacion-cedula/inicio-validacion-cedula.component';
import {ModalController} from '@ionic/angular';
import {AppState} from '../../../../../store/app.reducer';
import {Store} from '@ngrx/store';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import {SetUserAction} from '../../../../../store/auth/auth.actions';
import {AuthService} from '../../../../../services/auth/auth.service';
import { Intercom } from '@ionic-native/intercom/ngx';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';

@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.page.html',
    styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
    public show: boolean;
    public slideOpts = {
        effect: 'flip',
        initialSlide: 0,
        speed: 400,
        zoom: false
    };
    constructor(
        private modalController: ModalController,
        private store: Store<AppState>,
        private navigation: NavigationHelper,
        private auth: AuthService,
        private intercom: Intercom,
        private superSellerService: SuperSellerService) {
    }

    ngOnInit() {
        this.superSellerService.idSuperSeller = null;
        this.auth.isAuth()
            .then(user => {
                if (user !== false) {
                    this.store.dispatch(new SetUserAction(user.getUser()));
                    this.navigation.goTo(user.getUser().rootPage);
                    return;
                }

                this.show = true;
            });

        this.show = true;

        this.intercom.setInAppMessageVisibility('GONE');
    }

    slidesDidLoad(slides) {
        slides.startAutoplay();
    }

    openContactCenter() {
        this.intercom.displayMessenger();
    }

    async validacionDatos() {
        const modal = await this.modalController.create(<any>{
            component: InicioValidacionCedulaComponent
        });

        return await modal.present();
    }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {GetFrequentlyAskedAction} from '../../store/preguntas-frecuentes.actions';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../../../../../interfaces/IUser';
import {LoadingOff, LoadingOn} from '../../../general/store/actions/loading.actions';
import { Intercom } from '@ionic-native/intercom/ngx';
import {NavigationHelper} from '../../../../../helpers/navigation/navigation.helper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-preguntas-frecuentes',
    templateUrl: './preguntas-frecuentes.page.html',
    styleUrls: ['./preguntas-frecuentes.page.scss'],
})
export class PreguntasFrecuentesPage implements OnInit, OnDestroy {

    questions: any[] = [{}, {}, {}];
    preguntaSeleccionada = -1;
    private authSubscribe = new Subscription();
    private frequentlyAskedSubscribe = new Subscription();
    private user: IUser;
    private initQuestions;

    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private intercom: Intercom,
        private sanitizer: DomSanitizer,
        private router: Router,
        private navigation: NavigationHelper) {
        this.route.queryParams.subscribe(params => {
            this.user = this.route.snapshot.data['user'];
            if (this.router.getCurrentNavigation().extras.state) {
                const data = this.router.getCurrentNavigation().extras.state.data;
                if (data.backRootPage) {
                    data.backRootPage();
                }
            }
        });

    }

    ngOnInit() {
        this.store.dispatch(new LoadingOn());
        this.store.dispatch(new GetFrequentlyAskedAction(this.user.token));

        this.frequentlyAskedSubscribe = this.store.select('preguntas-frecuentes')
            .pipe(filter(res => res.frequentQuestions !== null))
            .pipe(map((res)=>{
                res.frequentQuestions.data.forEach(e => {
                    if(e.video) e.video = this.sanitizer.bypassSecurityTrustResourceUrl(e.video);
                });
                return res;
            }))
            .subscribe((res) => {
                this.questions = res.frequentQuestions.data;
                this.initQuestions = [...this.questions];
                this.store.dispatch(new LoadingOff());
            });
    }

    mostrarDetalleRespuesta(i) {
        if (this.preguntaSeleccionada === i) {
            this.preguntaSeleccionada = -1;
        } else {
            this.preguntaSeleccionada = i;
        }
    }

    validaMostrarPregunta(i) {
        if (this.preguntaSeleccionada === i) {
            return true;
        }
        return false;
    }

    ngOnDestroy(): void {
        this.authSubscribe.unsubscribe();
        this.frequentlyAskedSubscribe.unsubscribe();
    }

    search(searchString) {
        if (!searchString) {
            this.questions = [ ...this.initQuestions ];
            return;
        }

        this.questions = this.initQuestions.filter(question => {
            return (question.titulo.includes(searchString) || question.texto.includes(searchString));
        });
    }

    openChat() {
        this.intercom.displayMessenger();
    }

}

import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
// import { Firebase } from '@ionic-native/firebase/ngx';


// import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
// import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    private firebaseAnalytics: FirebaseAnalytics
    // , private firebase: Firebase
    // private ga: GoogleAnalytics, private firebaseAnalytics: FirebaseAnalytics
    ) { }

  initAnalytics() {
   /*  this.ga.startTrackerWithId('UA-XXXXXXXXX-X')
      .then(() => { }).catch(e => alert('Error starting GoogleAnalytics == ' + e)); */

    /* this.firebase.logEvent('firts_test_vtwo', { page: "dashboard" })
    .then((res: any) => console.log(JSON.stringify(res), "holammm"))
      .catch((error: any) => console.log(JSON.stringify(error), "holammm err"));
     */
      this.firebaseAnalytics.logEvent('firts_test1', { page: 'dashboard' })
      .then((res: any) => console.log( JSON.stringify(res)))
       .catch((error: any) => console.log(JSON.stringify(error)));
    this.firebaseAnalytics.setCurrentScreen('loginv2')
      .then((res: any) => console.log( JSON.stringify(res)))
      .catch((error: any) => console.log(JSON.stringify(error)));
  }

  sendEvent(event: string, params: any) {
    // console.log("entroooo");
    params = (params != undefined && params != null ) ? params : {} ;
    this.firebaseAnalytics.logEvent(event, params).then( success => {
      //alert('evento: ' + event);
      //alert(event + ' params: ' + JSON.stringify(params));
      // alert(JSON.stringify(success) + ' ' + event );
    }).catch(error => {
      //alert(JSON.stringify(error + " " +  event));
    });
  }

  screen(pagina){
    this.firebaseAnalytics.setCurrentScreen(pagina).then(success => {
      //alert('evento: ' + event);
      //alert('params: ' + params);
      // alert(JSON.stringify(success) + ' ' + event );
    }).catch(error => {
      // alert(JSON.stringify(error + " " +  event));
    });
  }
}

import {NgModule, LOCALE_ID} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import { AppLauncher } from '@ionic-native/app-launcher/ngx';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {CompartidoGeneralModule} from './modules/compartido/compartido-general.module';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {appReducers} from './store/app.reducer';
import {StoreModule} from '@ngrx/store';
import {environment} from '../environments/environment';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {ApiService} from './services/api/api.service';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthService} from './services/auth/auth.service';
import {CacheModule} from 'ionic-cache';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffect} from './store/auth/auth.effect';
import {IonicStorageModule} from '@ionic/storage';
import {OrdersService} from './services/orders/orders.service';
import {LocalNotificationService} from './services/localNotification/local-notification.service';
import {HTTP} from '@ionic-native/http/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import {RegisterEffect} from './modules/tendero/registro/store/registro.effect';
import {
    RegistroCapturaUbicacionComponent
} from './modules/tendero/registro/pages/registro/components/registro-captura-ubicacion/registro-captura-ubicacion.component';
import {
    RegistroResumenCapturaDatosComponent
} from './modules/tendero/registro/pages/registro/components/registro-resumen-captura-datos/registro-resumen-captura-datos.component';
import {AuthResolver} from './guards/auth.resolver';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Intercom } from '@ionic-native/intercom/ngx';
import {MobileAccessibility} from '@ionic-native/mobile-accessibility/ngx';
import { OrdersEffect } from './modules/compartido/pedidos/store/orders.efects';
import { DeeplinkEffect } from  './modules/compartido/deeplink/deeplink.efects'
import { OffersEffects } from './modules/compartido/general/store/effects/offers.effects';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import {AnalyticsService} from './services/analytics/analytics.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Market } from '@ionic-native/market/ngx';
import { VibrateService } from './services/vibrate/vibrate.service';
import { BackgroundGeolocation } from "@ionic-native/background-geolocation/ngx";

import { HammerGestureConfig , HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { loginEffect } from './modules/compartido/inicio/store/login.effect';
import { ShopsEffect } from './modules/vendedor/misClientes/store/mis-clientes.effect';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';
import {OneSignalService} from './services/oneSignal/one-signal.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { CashRegisterEffect } from './modules/tendero/cajaRegistradora/store/cash-register.effect';

import {Network} from '@ionic-native/network/ngx';
import { MessagesEffect } from './modules/compartido/misMensajes/store/messages.effect';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
import { Printer } from '@ionic-native/printer/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ShopkeepersCommunityEffect } from './modules/compartido/comunidadTenderos/pages/store/comunidad-tenderos.effect';
import { HelpTreeEffect } from './modules/compartido/arbolAyuda/store/help-tree.effect';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import {Deeplinks} from '@ionic-native/deeplinks/ngx';
import { InsurancesEffect } from './modules/tendero/seguros/store/insurances.effect';
import {EncuestasEffect} from './modules/compartido/encuestas/store/encuestas.effect';
import { GraphqlService } from './services/graphql/graphql.service';
import { SuperSellerService } from './services/users/super-seller.service';
import { MyOrdersEffect } from './modules/tendero/misPedidos/store/myOrders/myOrders.effect';
import { MotivosCalificacionEffect } from './modules/tendero/misPedidos/store/motivosCalificacion/motivosCalificacion.effect';
import esCo from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
import {TransporterEffect} from './modules/transportador/compartido/store/transporter.effect';

import { CreditsServices } from "./services/credits/credits.services";
import { MyCreditsEffect } from './modules/tendero/creditos/pages/store/credits.effect';
import {CallNumber} from '@ionic-native/call-number/ngx';
import { SpecialOffersService } from './services/specialOffers/special-offers.service';
import { MsgErrorService } from './services/api/msg-error.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';

registerLocaleData(esCo);

export class CustomHammerConfig extends HammerGestureConfig {
    overrides = {
        'pan' : {
            direction : Hammer.DIRECTION_ALL
        }
    };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot({
            name: '__mydb',
            driverOrder: ['indexeddb', 'sqlite', 'websql']
        }),
        StoreModule.forRoot(appReducers),
        EffectsModule.forRoot( [
            AuthEffect,
            RegisterEffect,
            OrdersEffect,
            DeeplinkEffect,
            OffersEffects,
            loginEffect,
            ShopsEffect,
            CashRegisterEffect,
            MessagesEffect,
            ShopkeepersCommunityEffect,
            InsurancesEffect,
            EncuestasEffect,
            HelpTreeEffect,
            MyOrdersEffect,
            MotivosCalificacionEffect,
            TransporterEffect,
            MyCreditsEffect
        ] ),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production
        }),
        CacheModule.forRoot(),
        CompartidoGeneralModule,
        FormsModule,
        ReactiveFormsModule,
        VirtualScrollerModule
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es-co' },
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        ApiService,
        AuthService,
        AuthResolver,
        OrdersService,
        MsgErrorService,
        GraphqlService,
        LocalNotificationService,
        OneSignalService,
        SuperSellerService,
        HTTP,
        Geolocation,
        Camera,
        File,
        WebView,
        OneSignal,
        Intercom,
        MobileAccessibility,
        ScreenOrientation,
        Market,
        FirebaseAnalytics,
        Vibration,
        NativeAudio,
        AnalyticsService,
        VibrateService,
        {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
        BarcodeScanner,
        Keyboard,
        Device,
        Printer,
        {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
        Diagnostic,
        OpenNativeSettings,
        Network,
        BluetoothSerial,
        LocalNotifications,
        Deeplinks,
        BackgroundGeolocation,
        CreditsServices,
        SpecialOffersService,
        AppLauncher,
        CurrencyPipe,
        CallNumber,
        AppVersion,
        SocialSharing
        // Firebase
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        RegistroCapturaUbicacionComponent,
        RegistroResumenCapturaDatosComponent
    ]
})
export class AppModule {}

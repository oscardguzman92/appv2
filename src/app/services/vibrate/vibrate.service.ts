import {Injectable} from '@angular/core';
import {NativeAudio} from '@ionic-native/native-audio/ngx';
import {Vibration} from '@ionic-native/vibration/ngx';


@Injectable({
    providedIn: 'root'
})
export class VibrateService {

    constructor(private vibration: Vibration, private nativeAudio: NativeAudio) {
    }

    /* vibra por unsegundo */
    makeVibrate() {
        this.vibration.vibrate(300);
    }

    /* vibra por el tiempo determinado */
    makeVibrateCustomTime(miliseconds: number) {
        this.vibration.vibrate(miliseconds);
    }

    /* apaga vibracion */
    turnOff() {
        this.vibration.vibrate(0);
    }

    /* reproduce el sonido */
    playSound() {
        // can optionally pass a callback to be called when the file is done playing
        this.nativeAudio.play('uniqueId1', () => {});
    }

    uploadSound() {
        this.nativeAudio.preloadSimple('uniqueId1', 'assets/sounds/1.mp3').then(onSuccess => {}, onError => {
            console.log('precarga de archivo bad', onError);
        });
    }

    playAndVibrate() {
        this.makeVibrate();
        this.playSound();
    }
}

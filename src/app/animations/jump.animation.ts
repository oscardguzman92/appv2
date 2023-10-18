import {animate, state, style, transition, trigger} from '@angular/animations';

export const jumpAnimation = trigger('jump', [
    state('start', style({
        transform: 'scale(1.0)'
    })),
    state('end', style({
        transform: 'scale(1.1)'
    })),
    transition('start => end', animate(100)),
    transition('end => start', animate('100ms 0.2s ease-in-out'))
]);

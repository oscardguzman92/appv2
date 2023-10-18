import {animate, state, style, transition, trigger} from '@angular/animations';

export const opacityAnimation = trigger('opacity', [
    state('start', style({
        opacity: '0'
    })),
    state('end', style({
        opacity: '1'
    })),
    transition('start => end', animate(100)),
    transition('end => start', animate('100ms 0.2s ease-in-out'))
]);

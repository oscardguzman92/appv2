import {Component, ViewChild} from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    public item: number;
    @ViewChild('containerCards') container: any;

    constructor() {
        this.item = -1;
    }

    expand(item, event) {
        const card = this.getCard(event);

        if (this.item === item) {
            this.item = -1;
            if (card.previousElementSibling) {
                card.previousElementSibling.style.order = item;
            }
            card.style.order = item + 1 ;
            return;
        } else {
            this.reorganizarElementosCard();
        }

        if ((item + 1) % 2 === 0) {
            card.previousElementSibling.style.order = item + 1;
            card.style.order = item;
        }

        this.item = item;
    }

    getCard(event, element?) {
        if (!element) {
            element = event.target;
            return this.getCard(event, element);
        }

        if (!element.classList.contains('product-card')) {
            element = element.parentNode;
            return this.getCard(event, element);
        }

        return element;
    }

    private reorganizarElementosCard() {
        const arrayCards = this.container.nativeElement.querySelectorAll('.product-card');

        for (let i = 0; i < arrayCards.length; i++) {
            const element = arrayCards[i];

            element.style.order = i + 1;
        }
    }
}

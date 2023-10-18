import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IProduct} from '../../../../../../../interfaces/IProduct';
import {UtilitiesHelper} from '../../../../../../../helpers/utilities/utilities.helper';
import {jumpAnimation} from '../../../../../../../animations/jump.animation';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
    @Input() product: IProduct;
    @Output() addProduct = new EventEmitter();
    @Output() rmProduct = new EventEmitter();
    @Output() writerProduct = new EventEmitter();
    @Output() blurEvent = new EventEmitter();

    public statusInputCountProd: boolean;

    constructor(private utilities: UtilitiesHelper) {
    }

    ngOnInit() {
    }

    get getFullName() {
        return this.utilities.getFullProductName(this.product);
    }

    add() {
        if (!this.product.cantidad) {
            this.product.cantidad = 0;
        }

        this.product.cantidad ++;
        this.addProduct.emit({value: parseFloat(this.product.precio), product: this.product});
    }

    rm() {
        if (!this.product.cantidad) {
            this.rmProduct.emit({value: parseFloat(this.product.precio), product: this.product});
            return;
        }

        if (this.product.cantidad <= 0) {
            this.rmProduct.emit({value: parseFloat(this.product.precio), product: this.product});
            return;
        }

        this.product.cantidad--;
        this.rmProduct.emit({value: parseFloat(this.product.precio), product: this.product});
    }

    changeCountProd($count) {
        this.product.cantidad = parseInt($count.value);
        this.writerProduct.emit();
    }

    focus() {
        this.statusInputCountProd = true;
    }

    blur () {
        this.statusInputCountProd = false;
        this.blurEvent.emit(this.product);
    }
}

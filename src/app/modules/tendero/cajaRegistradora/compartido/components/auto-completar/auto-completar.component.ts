import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionsService} from '../../../services/options.service';

@Component({
  selector: 'app-auto-completar',
  templateUrl: './auto-completar.component.html',
  styleUrls: ['./auto-completar.component.scss'],
})
export class AutoCompletarComponent implements OnInit {
    public tagsSelected = [];
    public tagsValid = [];
    public tagsInvalid = [];
    public anotherText: string;
    public availableAnother: boolean;
    public error: boolean;

    @Output() submitEvent = new EventEmitter();

    constructor(public optionService: OptionsService) {
        this.availableAnother = false;
        this.error = false;
    }

    ngOnInit() {
    }

    selected(event) {
        if (!event) {
            this.tagsSelected.splice(this.tagsSelected.length - 1, 1);
            return;
        }

        if (!event.tag) {
            this.tagsSelected.splice(this.tagsSelected.length - 1, 1);
            return;
        }

        this.tagsValid.push(event.id);

        setTimeout(() => {
            const div = document.querySelector('ion-auto-complete .ng-star-inserted');
            div.scrollLeft = 9999;
        }, 100);
    }

    change($event) {
        this.anotherText = $event.target.value;

        if (!this.anotherText) {
            return;
        }

        if ($event.key === 'Enter') {
            this.saveAnother();
            this.anotherText = '';
        }
    }

    saveAnother() {
        if (this.anotherText === '') {
            return;
        }

        const validate = this.tagsSelected.filter((tag) => {
            return (tag.tag === this.anotherText);
        });

        if (validate.length > 0) {
            this.error = true;
            setTimeout(() => {
                this.error = false;
            }, 1000);
            return;
        }

        this.availableAnother = false;
        this.tagsSelected.push({tag: this.anotherText});
        this.tagsInvalid.push({tag: this.anotherText});
        this.anotherText = '';

        setTimeout(() => {
            const div = document.querySelector('ion-auto-complete .ng-star-inserted');
            div.scrollLeft = 9999;
        }, 100);
    }

    removeItem(item) {
        if (item.id) {
            this.deleteById(item.id);
            return;
        }

        if (item.tag) {
            this.deleteByName(item.tag);
            return;
        }
    }

    deleteById(id) {
        this.tagsValid = this.tagsValid.filter((item) => {
            return item != id;
        });
    }

    deleteByName(tag) {
        this.tagsInvalid = this.tagsInvalid.filter((item, index) => {
            return item.tag != tag;
        });
    }

    submit(): void {
        this.submitEvent.emit([this.tagsSelected, this.tagsValid, this.tagsInvalid]);
    }
}

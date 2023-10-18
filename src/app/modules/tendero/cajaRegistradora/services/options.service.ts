import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {AutoCompleteService} from 'ionic4-auto-complete';

@Injectable({
    providedIn: 'root'
})
export class OptionsService implements AutoCompleteService {
    formValueAttribute: any;
    labelAttribute: string;
    public options: any[];

    constructor() {
        this.labelAttribute = 'tag';
    }

    public setOptions(options) {
        console.log('options', options);
        this.options = options;
    }

    getItemLabel(item: any): any {
        return item.tag;
    }

    getResults(term: any): any {
        let observable: Observable<any>;

        observable = of(this.options);

        return observable.pipe(
            map(
                (result) => {
                    return result.filter(
                        (item) => {
                            return item.tag.toLowerCase().startsWith(
                                term.toLowerCase()
                            );
                        }
                    );
                }
            )
        );
    }
}

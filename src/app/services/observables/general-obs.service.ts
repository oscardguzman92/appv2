import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable({
	providedIn: "root"
})
export class GeneralObsService {
	private deepSubject = new Subject<any>();

	constructor() {}

	deepPublish(data: any) {
		this.deepSubject.next(data);
	}

	deepObs(): Subject<any> {
		return this.deepSubject;
	}
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpRequest} from '@angular/common/http';
import {from, Observable, throwError} from 'rxjs';
import {catchError, map, timeout, tap} from 'rxjs/operators';
import {CacheService} from 'ionic-cache';
import {HTTP} from '@ionic-native/http/ngx';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    public url: string;
    private headers: HttpHeaders;
    private timed: number;
    private ttl: number;

    constructor(private http: HttpClient, private cache: CacheService, private httpNative: HTTP) {
        //this.url = 'https://bravo.storeapp.net/';
        this.url = 'https://administrador.storeapp.net/';
        this.timed = 15000; // en milisegundos
        this.ttl = 3600; // en segundos
        this.headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
    }

    public post(endpoint: string, parameters?: any, withoutCache?: boolean): Observable<any> {
        this.httpNative.setDataSerializer('urlencoded');
        const req = from(this.httpNative.post(this.url + endpoint, parameters, {'Content-Type': 'application/x-www-form-urlencoded'}))
            .pipe(timeout(this.timed))
            .pipe(
                map(res => {
                    return JSON.parse(res.data);
                })
            )
            .pipe(catchError(this.handleError));
        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    public post2(endpoint: string, parameters?: any, withoutCache?: boolean): Observable<any> {
        this.httpNative.setDataSerializer('json');
        // tslint:disable-next-line: max-line-length
        const req = from(this.httpNative.post(endpoint, parameters, {'Content-Type': 'application/json'}))
            .pipe(timeout(25000))
            .pipe(
                map(res => {
                    return JSON.parse(res.data);
                })
            )
            .pipe(catchError(this.handleError));

        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    public post3(endpoint: string, parameters?: any, withoutCache?: boolean): Observable<any> {
        this.httpNative.setDataSerializer('json');
        const req = from(this.httpNative.post(this.url + endpoint, parameters, { 'Content-Type': 'application/json' }))
            .pipe(timeout(this.timed))
            .pipe(
                map(res => {
                    return res.data;
                })
            )
            .pipe(catchError(this.handleError));

        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    get(endpoint: string, params?: HttpParams, withoutCache?: boolean, timeOut?: number) {
        if (!isNaN(timeOut)) {
            this.timed = timeOut;
        }
        if (!timeOut) {
            this.timed = 15000;
        }


        const req = this.http.get(this.url + endpoint, {params: params})
            .pipe(timeout(this.timed))
            .pipe(catchError(this.handleError));

        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    get2(endpoint: string, params?: HttpParams, withoutCache?: boolean, timeOut?: number) {
        if (!isNaN(timeOut)) {
            this.timed = timeOut;
        }
        const req = this.http.get(this.url + endpoint, {params: params})
            .pipe(timeout(this.timed))
            .pipe(catchError(this.handleError));

        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    getShowProgress(endpoint: string, params?: HttpParams, withoutCache?: boolean, timeOut?: number) {
        const headers = new HttpHeaders('Content-Length');
        const reqObj = new HttpRequest('GET', this.url + endpoint, {
            headers: headers,
            reportProgress: true,
            params: params
        });

        if (!isNaN(timeOut)) {
            this.timed = timeOut;
        }

        const req = this.http.request(reqObj)
            .pipe(timeout(this.timed))
            .pipe(catchError(this.handleError));

        if (withoutCache) {
            return req;
        }

        return this.cache.loadFromObservable(endpoint, req, endpoint, this.ttl);
    }

    put(endpoint: string, params?: HttpParams, timeOut?: number) {
        if (!isNaN(timeOut)) {
            this.timed = timeOut;
        }
        const req = this.http.put(this.url + endpoint, {params: params})
            .pipe(timeout(this.timed))
            .pipe(catchError(this.handleError));

        return req;

    }


    private handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    getEndpoint() {
        return this.url;
    }

}

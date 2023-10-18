import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {ApiService} from '../api/api.service';
import {HttpParams} from '@angular/common/http';
//import * as PouchDBUpsert from 'pouchdb-upsert/dist/pouchdb.upsert';
//import PouchDB from 'pouchdb';
//import * as PouchDB from 'pouchdb/dist/pouchdb';
import * as PouchDB from 'pouchdb/dist/pouchdb';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {

    public db:any;
    public remote:string;
    public archivo_sin_conexion:any = null;
    constructor(private api: ApiService, private storage: Storage) {
        this.db = new PouchDB('https://admin:l1nd0n3n3@noconexion.storeapp.net/archivo_sin_conexion');
    }

    getOfflineData(token: string) {
        const params = new HttpParams()
            .set('token', token);
        return this.api.getShowProgress('getDatosSinConexion', params, true, 900000);
    }

    isOfflineActive(cb) {
        this.storage.get('withoutConnection').then(success => {
            return cb(success);
        });
    }

    async getOfflineDataFromCouchDB(vendedor_id, dia_numero, obligatorio = false) {
        if (!obligatorio) {
            this.archivo_sin_conexion = await this.storage.get('getDatosSinConexionCouch');
        }

        if(!this.archivo_sin_conexion && vendedor_id && dia_numero ){
            let id = vendedor_id + '_' + dia_numero;
            this.archivo_sin_conexion = await this.db.get(id);
            this.archivo_sin_conexion.productos = this.archivo_sin_conexion.productos.sort(this.compare);
            this.storage.set('getDatosSinConexionCouch', this.archivo_sin_conexion);
        }
        return this.archivo_sin_conexion;
    }

    clearData() {
        this.archivo_sin_conexion = null;
    }

    async getDataShop(idShop) {
        const data = await this.storage.get('getDatosSinConexionCouch');
        if (!data) {
            return [[], []];
        }
        if (!idShop) {
            return [[], []];
        }

        try {
            const productosStorage = data.productos;
            const productosOff = data.tiendas[idShop].productos;
            return [productosStorage, productosOff];
        } catch (e) {
            console.error("Ha ocurrido un error buscando. " + e);
            return [[], []];
        }
    }

    compare( a, b ) {
        if ( a.c_s < b.c_s ){
            return -1;
        }
        if ( a.c_s > b.c_s ){
            return 1;
        }
        return 0;
    }
}

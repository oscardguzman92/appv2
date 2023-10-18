import {Injectable} from '@angular/core';
import {IProduct} from 'src/app/interfaces/IProduct';
import {Storage} from '@ionic/storage';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GraphqlService {

    public prices: unknown;

    constructor(private storage: Storage) {
    }

    public async getLiquidacion_pedido(liquidador, products, user) {
        let cliente = user.cedula.toString();
        let vendedor = liquidador.cod_vendedor;
        let ctp = liquidador.ctp;
        let sucursal = liquidador.sucursal;

        let p = '';
        const v = products;
        v.forEach((i: any, index) => {
            const codigo_producto = i.cod_sap;
            const cantidad = i.cantidad;
            const embalaje = i.unidad_medida;
            if (index == 0) {
                p = '{codigo_producto:\"' + codigo_producto + '\", cantidad:' + cantidad + ',embalaje:\"' + embalaje + '\"}';
            } else {
                p = p + ',{codigo_producto:\"' + codigo_producto + '\", cantidad:' + cantidad + ',embalaje:\"' + embalaje + '\"}';
            }
        });

        let url = (liquidador.url != null) ? liquidador.url : 'https://us-central1-gcp-tropi-gaussia.cloudfunctions.net/graphql';
        const token = (liquidador.token != null) ? liquidador.token : '8dfdabfd-94e2-4cc1-95e8-3c2fe59b787b';
        const tokenBody = (liquidador.token_body != null) ? liquidador.token_body : 'd82dab13-c253-419e-a39b-81e68b898077';
        url = url + '?token=' + token;

        const myHeaders = new Headers();
        myHeaders.append('TROPI-TOKEN', tokenBody);
        myHeaders.append('Content-Type', 'application/json');

        const graphql = JSON.stringify({
            query: 'query{liquidacion_pedido(pedido: {centro_operacion: "170",numero_pedido: "3555",codigo_bodega: "001",codigo_cliente: "'+ cliente +'" ,codigo_sucursal: "' + sucursal + '",codigo_terminopago: "'+ctp+'",codigo_vendedor: "'+vendedor+'",lista_precio: "999", detallesliquidacion: [' + p + ']}){ total_bruto total_neto total_impuestos total_descuentos detallesliquidados { codigo_producto precio_neto precio_bruto valor_impuestos valor_descuentos } } } '
        });

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: graphql,
            redirect: 'follow'
        };

        return await fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
                const data = JSON.parse(result);
                if (!data.data) {
                    return false;
                }

                if (!data.data.liquidacion_pedido) {
                    return false;
                }

                if (!data.data.liquidacion_pedido.total_descuentos) {
                    return false;
                }

                if (data.data.liquidacion_pedido.total_descuentos <= 0) {
                    return false;
                }
                console.log(data.data.liquidacion_pedido,"liquidador");
                return data.data.liquidacion_pedido;
            });
    }

    public getLiquidacion_pedidoFake() {
        const simpleObservable = new Observable((observer) => {
            observer.next(30000);
            observer.complete();
        });

        return simpleObservable;
    }
}

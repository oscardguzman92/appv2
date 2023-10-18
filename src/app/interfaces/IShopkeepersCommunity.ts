import { ICommentsPost } from './ICommentsPost';

export interface IShopkeepersCommunity {
    // properties by service
    cliente_id: string;
    created_at: string;
    email: string;
    fecha_fin: string;
    fecha_inicio: string;
    medias: {
        url: any;
        type: string;
    }[];
    tipo: string;
    url: string;
    nombre_contacto: string;
    post_id: string;
    texto: string;
    tiendas: {
        barrio: string;
        basura: boolean;
        ciudad_id: number;
        cliente_id: number;
        created_at: string;
        direccion: string;
        estrato: number;
        fecha_verificado: null;
        id: number;
        latitud: string;
        localidad: string;
        longitud: string;
        nombre: string;
        temporal: number;
        tienda_tipologia_id: number;
        updated_at: string;
        verificado: number;
        verificado_por: null;
    }[];
    titulo: string;
    user_id: number;
    cantidadComentarios: number
    cantidadMeGustas: number
    meGustaUsuario: boolean;
    comments: ICommentsPost[];
    tipo_usuario: any;
    compania: any;
    ciudad: string;
}

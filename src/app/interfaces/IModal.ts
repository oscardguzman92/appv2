export interface IModal {
    id: string;
    titulo: string;
    texto: string;
    imagen: string;
    link_externo: string;
    datos: string;
    persistente: boolean;
    activo: boolean;
    user_id: number;
    segmentacion_id: number;
}

export interface IMessages {
    data: IMessage[];
    current_page: number;
    from: number;
    last_page: number;
    next_page_url: string;
    per_page: number;
    prev_page_url: any;
    to: number;
    total: number;
}

export interface IMessage {
    estado_lectura: boolean;
    fecha: any;
    id: number;
    mensaje: string;
    titulo: string;
    datos: any;
}
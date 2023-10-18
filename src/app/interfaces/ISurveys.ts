
export interface ISurveys {
    // properties by service
    id: number;
    nombre: string;
    puntos: number;
    fecha_inicio: string;
    fecha_fin: string;
    finalizada: boolean;
    preguntas: {
        id: number;
        pregunta: string;
        imagen?: string;
        video?: string;
        encuesta_tipo_id: number;
        isImage?: boolean;
        photoCamera?: string;
        respuestas: {
            encuesta_id: number;
            id: number;
            orden: number;
            titulo: string;
            valor: string;
        }[];
        tipo_encuesta: {
            id: number;
            slug: string;
            texto: string;
        };
    }[];
    created_at;
    opened?: boolean;
    parametro?: string;
}

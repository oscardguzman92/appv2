export interface IFrequentlyAsked {
    // properties by service

    current_page: number;
    from: number;
    last_page: number;
    next_page_url: string;
    per_page: number;
    prev_page_url: any;
    to: number;
    total: number;
    data: {
        id: number;
        titulo: string;
        texto: string;
        tema_relacionado: string;
        orden: number;
        imagen: any;
        video: any;
    }[];
}

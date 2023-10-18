export interface IReason {
    id: number;
    motivo: string;
    motivo_hijo?: IReason[];
    motivo_padre?: IReason[];
}

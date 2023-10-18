export interface ISale {
    id: number;
    quantity: number;
    total: number;
    iva: number;
    subtracting: number;
    trustworthy: boolean;
    card: boolean;
    cash: boolean;
    paid_out: boolean;
    shopkeeper_id: number;
    client_id: number;
    created_at: Date;
}

export interface IClient {
    _id: number;
    name: string;
    phone: string;
}

export interface IProduct {
    _id: number;
    ean: string;
    fullname: string;
    name: string;
    description: string;
    variant: string;
    presentation: string;
    size: number;
    unit_measurement: number;
    quantity: number;
    price: number;
    iva: number;
    show: boolean;
    outstanding: boolean;
    overriding: boolean;
    order: number;
    brand_id: number;
    shopkeeper_id: number;
    mysql_id: number;
}

export interface IShopkeeperProduct {
    product_id: number;
    shopkeeper_id: number;
    price: number;
    outstanding: boolean;
    overriding: boolean;
    order: number;
}


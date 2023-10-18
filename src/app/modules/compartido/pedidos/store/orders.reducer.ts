import {Order} from '../../../../models/Order';
import {OrdersActions, SET_ORDER_SHOP, SET_CATEGORIES, GET_CATEGORIES, SET_PRODUCTS, GET_PRODUCTS, FILTER_PRODUCTS} from './orders.actions';
import { ICategory } from 'src/app/interfaces/ICategory';
import { IProduct } from 'src/app/interfaces/IProduct';

export interface AuthState {
    order: Order;
}

const authInitial: AuthState = {
    order: null
};

export function orderReducer(state = authInitial, action: OrdersActions): AuthState {

    switch (action.type) {

        case SET_ORDER_SHOP:
            return {
                order: { ...action.order }
            };
        default:
            return state;
    }

}

export interface CategoriesState {
    categories: ICategory[];
}


const categoryInitial: CategoriesState = {
    categories: null
};

export function categoriesReducer(state = categoryInitial, action: OrdersActions): CategoriesState {

    switch (action.type) {

        case GET_CATEGORIES:
            return <CategoriesState> {
                categories: null
            };

        case SET_CATEGORIES:
            return <CategoriesState> {
                categories: {
                    ...action.categories
                }
            };

        default:
            return state;
    }

}


export interface ProductsState {
    products: IProduct[];
}


const productsInitial: ProductsState = {
    products: null
};

export function productsReducer(state = productsInitial, action: OrdersActions): ProductsState {

    switch (action.type) {

        case GET_PRODUCTS:
            return <ProductsState> {
                products: null,
            };

        case FILTER_PRODUCTS:
            return <ProductsState> {
                products: {
                    ...action.productsCompare
                }
            };

        case SET_PRODUCTS:
            return <ProductsState> {
                products: {
                    ...action.products
                }
            };

        default:
            return state;
    }

}

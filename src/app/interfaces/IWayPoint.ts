import {ICoords} from './ICoords';

export interface IWayPoint {
    location: ICoords | string;
    stopover: boolean;
    shopName?: string;
    address?: string;
    orden?: number;
}

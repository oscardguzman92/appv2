import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CashRegisterHelper {

    constructor() {
    }

    getUnique(arr, comp) {
        const unique = arr
          .map(e => e[comp])
          .map((e, i, final) => final.indexOf(e) === i && i)
          .filter(e => arr[e]).map(e => arr[e]);
        return unique;
      }

      removeDuplicates(array, key) {
        const lookup = new Set();
        return array.filter(obj => !lookup.has(obj[key]) && lookup.add(obj[key]));
      }

      findObjectByKey(array, key, value) {
        for (let i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
            return i;
          }
        }
        return -1;
      }

}

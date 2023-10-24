import { log } from "../log.js";

export default class CollectionFilter {
    constructor(objectsList, params, model) {
        this.objectsList = objectsList;
        this.params = params;
        this.model = model;
    }
    static valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    static compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    static innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
    filter(key, expectedVal) {
        return this.objectsList.filter(entry => {return CollectionFilter.valueMatch(entry[key], expectedVal)});
    }

    get() {
        Object.keys(this.params).forEach(key => {
            switch (key) {
                case "sort":
                    let attrs = this.params[key].split(",");
                    let sortKey = attrs[0];
                    let desc = attrs[1] !== undefined;
                    this.objectsList.sort((a, b) => {
                        return CollectionFilter.innerCompare(a[sortKey], b[sortKey]);
                    });
                    if (desc) this.objectsList.reverse();
                    break;
                default:
                    this.objectsList = this.filter(key, this.params[key]);
                    break;
            }
        });
        return this.objectsList;
    }
}
import { deleteByIndex } from "../utilities.js";

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
    static equal(ox, oy) {
        let equal = true;
        Object.keys(ox).forEach(function (member) {
            if (ox[member] != oy[member]) {
                equal = false;
                return false;
            }
        })
        return equal;
    }

    filter(key, expectedVal) {
        return this.objectsList.filter(entry => {return CollectionFilter.valueMatch(entry[key], expectedVal)});
    }

    get() {
        if (this.params !== null) {
            Object.keys(this.params).forEach(key => {
                switch (key) {
                    case "sort":
                        let attrs = this.params[key].split(",");
                        let sortKey = attrs[0];
                        let desc = attrs[1] !== undefined;
                        this.objectsList.sort((a, b) => {
                            return CollectionFilter.innerCompare(a[sortKey], b[sortKey]);
                        });
                        let duplicateIds = [];
                        for (let i = 0; i < this.objectsList.length-1; i++) {
                            if (CollectionFilter.equal(this.objectsList[i], this.objectsList[i+1])) {
                                duplicateIds.push(i+1);
                            }
                        }
                        deleteByIndex(this.objectsList, duplicateIds);
                        if (desc) this.objectsList.reverse();
                        break;
                    case "fields":
                        let fields = this.params[key].split(",");

                        this.objectsList = this.objectsList.map((e) => {
                            let output = {};
                            fields.forEach(key => {
                                output[key] = e[key];
                            });
                            return output;
                        });
                        break;
                    case "limit":
                        let limit = parseInt(this.params[key]);
                        let offset = (parseInt(this.params["offset"]) || 0)
                        let index = limit * offset;
                        this.objectsList = this.objectsList.slice(index, index + limit-1);
                        break;
                    case "offset":
                        break; // Handled in limit
                    default:
                        this.objectsList = this.filter(key, this.params[key]);
                        break;
                }
            });
        }
        return this.objectsList;
    }
}
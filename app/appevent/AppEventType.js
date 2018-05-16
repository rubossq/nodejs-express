const NEW = 1;
const UPDATE = 2;
const RATING = 3;
const DOWNLOADS = 4;
const RANKING = 5;
const REMOVE = 6;
const HYPE = 7;

class AppEventType {
    constructor() {

    }

    static get NEW() {
        return NEW;
    }

    static get UPDATE() {
        return UPDATE;
    }

    static get RATING() {
        return RATING;
    }

    static get RANKING() {
        return RANKING;
    }

    static get DOWNLOADS() {
        return DOWNLOADS;
    }

    static get REMOVE() {
        return REMOVE;
    }

    static get HYPE() {
        return HYPE;
    }

    static getTypes() {
        return [NEW, UPDATE, RATING, RANKING, DOWNLOADS, REMOVE, HYPE];
    }
}

module.exports = AppEventType;
const NEW_APP = 1;
const UPDATE_APP = 2;
const REMOVE_APP = 3;
const HYPE = 4;

class DevEventType {
    constructor() {

    }

    static get NEW_APP() {
        return NEW_APP;
    }

    static get UPDATE_APP() {
        return UPDATE_APP;
    }

    static get REMOVE_APP() {
        return REMOVE_APP;
    }

    static get HYPE() {
        return HYPE;
    }

    static getTypes() {
        return [NEW_APP, UPDATE_APP, REMOVE_APP, HYPE];
    }
}

module.exports = DevEventType;
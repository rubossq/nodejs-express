const LIST = "list";
const DEVELOPER = "developer";

class AppEntityType {
    constructor() {

    }

    static get LIST() {
        return LIST;
    }

    static get DEVELOPER() {
        return DEVELOPER;
    }

    static getTypes() {
        return [LIST, DEVELOPER];
    }
}

module.exports = AppEntityType;
const ITUNES = 1;
const GOOGLE_PLAY = 2;

class StoreType {
    static get ITUNES() {
        return ITUNES;
    }

    static get GOOGLE_PLAY() {
        return GOOGLE_PLAY;
    }

    static getTypes() {
        return [ITUNES, GOOGLE_PLAY];
    }
}

module.exports = StoreType;
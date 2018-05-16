const StoreType = require("./StoreType");

const GOOGLE_PLAY_APP = "https://play.google.com/store/apps/details?id=%package%";
const ITUNES_APP = "https://itunes.apple.com/us/app/%id%";

const GOOGLE_PLAY_DEV = "https://play.google.com/store/apps/dev?id=%id%";
const ITUNES_DEV = "https://itunes.apple.com/us/developer/%id%";

class StoreManager {

    static getAppPath(store_type, pathObj) {
        if (store_type === StoreType.GOOGLE_PLAY) {
            return StoreManager.getGPApp(pathObj);
        } else if (store_type === StoreType.ITUNES) {
            return StoreManager.getIApp(pathObj);
        }
    }

    static getDevPath(store_type, pathObj) {
        if (store_type === StoreType.GOOGLE_PLAY) {
            return StoreManager.getGPDev(pathObj);
        } else if (store_type === StoreType.ITUNES) {
            return StoreManager.getIDev(pathObj);
        }
    }

    static getGPApp(obj) {
        return GOOGLE_PLAY_APP.replace("%package%", obj.package);
    }

    static getIApp(obj) {
        return ITUNES_APP.replace("%id%", obj.id);
    }

    static getGPDev(obj) {
        return GOOGLE_PLAY_DEV.replace("%id%", obj.id);
    }

    static getIDev(obj) {
        return ITUNES_DEV.replace("%id%", obj.id);
    }
}

module.exports = StoreManager;
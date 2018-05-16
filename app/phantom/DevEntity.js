class DevEntity {
    constructor(obj) {
        this.id = obj.id || obj._id;
        this.store_dev_id = obj.store_dev_id;
        this.ptime = obj.ptime;
    }

    getId() {
        return this.id;
    }

    getStoreDevId() {
        return this.store_dev_id;
    }

    getPtime() {
        return this.ptime;
    }
}

module.exports = DevEntity;
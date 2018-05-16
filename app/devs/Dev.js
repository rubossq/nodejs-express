class Dev {
    constructor(obj) {
        this.id = obj.id || obj._id;

        this.store_dev_id = obj.store_dev_id;
        this.name = obj.name;
        this.email = obj.email;
        this.address = obj.address;
        this.website = obj.website;
        this.ptime = obj.ptime;

        //this.hype = obj.hype;
        //this.active = obj.active;
        //this.app_count = obj.app_count;
        //this.installs_count = obj.installs_count;
        //this.avg_rating = obj.avg_rating;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPtime() {
        return this.ptime;
    }

    getEmail() {
        return this.email;
    }

    getStoreDevId() {
        return this.store_dev_id;
    }

    getAddress() {
        return this.address;
    }

    getWebsite() {
        return this.website;
    }
}

module.exports = Dev;
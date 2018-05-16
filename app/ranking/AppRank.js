class AppRank {
    constructor(obj) {
        this.id = obj.id || obj._id;

        this.country_id = obj.country_id;
        this.app_id = obj.app_id;
        this.rank = obj.rank;
        this.category = obj.category;
    }
}

module.exports = AppRank;
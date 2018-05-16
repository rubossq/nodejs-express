let {AppEvent, AppEventManager} = require("../app/appevent");
let tempstor = require("estorm-tempstor");

/**
 * CREATE NEW APP EVENT
 */
module.exports.create = function (req, res, callback) {
    AppEventManager.create(new AppEvent(tempstor.get(req, AppEventManager.ENTITY)), callback || function () {
    });
};

module.exports.createForward = function (appEvent, callback) {
    AppEventManager.create(new AppEvent(appEvent), callback || function () {
    });
};

/**
 * DELETE EXIST APP EVENT
 */
module.exports.delete = function (req, res, callback) {
    AppEventManager.remove(new AppEvent(tempstor.get(req, AppEventManager.ENTITY)), callback);
};

module.exports.clean = function (req, res, callback) {
    AppEventManager.removeByQuery({etime: {$lte: tempstor.get(req, AppEventManager.ENTITY).etime}}, callback);
};

/**
 * UPDATE EXIST APP EVENT
 */
module.exports.update = function (req, res, callback) {
    AppEventManager.update(new AppEvent(tempstor.get(req, AppEventManager.ENTITY)), callback);
};

/**
 * GET LIST OF EXIST APP EVENTS
 */
module.exports.list = function (req, res, callback) {
    AppEventManager.list({}, callback);
};

module.exports.listByApp = function (req, res, callback) {
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);
    AppEventManager.count({app_id: "" + appEvent.app_id},
        {_id: "$type", count: {$sum: 1}}, appEvent, callback);
};

module.exports.listByAppRanking = function (req, res, callback) {
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);
    AppEventManager.count({type: appEvent.type, app_id: "" + appEvent.app_id},
        {_id: "$data.country_id", rank: {$min: "$data.rank"}}, appEvent, callback);
};

module.exports.listByAppRankingForward = function (appEvent, callback) {
    AppEventManager.count({type: appEvent.type, app_id: "" + appEvent.app_id},
        {_id: "$data.country_id", rank: {$min: "$data.rank"}}, appEvent, callback);
};


module.exports.listByAppRankingRowsForward = function (appEvent, callback) {

    AppEventManager.countForward({
            type: appEvent.type,
            app_id: "" + appEvent.app_id,
            etime: {$gte: appEvent.start, $lte: appEvent.end}
        },
        {_id: "$data.country_id", rank: {$min: "$data.rank"}}, callback);
};

module.exports.listRankingForward = function (appEvent, callback) {
    AppEventManager.countForward({type: appEvent.type, etime: {$gte: appEvent.start, $lte: appEvent.end}},
        {_id: {country_id: "$data.country_id", app_id: "$app_id"}, rank: {$min: "$data.rank"}}, callback);
};

module.exports.listRankingByCountryForward = function (appEvent, callback) {
    AppEventManager.countForward({type: appEvent.type, etime: {$gte: appEvent.start, $lte: appEvent.end}, "data.country_id": appEvent.country_id},
        {_id: "$app_id", rank: {$min: "$data.rank"}}, callback);
};

module.exports.listByType = function (req, res, callback) {
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);
    AppEventManager.count({type: appEvent.type, app_id: appEvent.app_id},
        {_id: appEvent._id || null, count: {$sum: 1}}, appEvent, callback);
};

module.exports.listEventsByType = function (req, res, callback) {
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);
    AppEventManager.list({type: appEvent.type, app_id: appEvent.app_id}, callback);
};

module.exports.listEventsByTypeForward = function (appEvent, callback) {
    AppEventManager.list({type: appEvent.type, app_id: appEvent.app_id}, callback);
};

module.exports.eventsPeriod = function (req, res, callback) {
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);

    let order = {};
    order[appEvent._id] = -1;

    AppEventManager.maxPeriod({
        type: appEvent.type,
        app_id: appEvent.app_id,
        etime: {}
    }, order, appEvent, callback);
};

module.exports.eventsPeriodForward = function (appEvent, callback) {

    let order = {};
    order[appEvent._id] = -1;

    AppEventManager.maxPeriod({
        type: appEvent.type,
        app_id: appEvent.app_id,
        etime: {}
    }, order, appEvent, callback);
};

/**
 * GET CERTAIN APP EVENT BY ID
 */
module.exports.info = function (req, res, callback) {
    AppEventManager.info(new AppEvent(tempstor.get(req, AppEventManager.ENTITY)), callback);
};

/**
 * GET CERTAIN APP EVENT BY URL
 */
module.exports.get = function (req, res, callback) {
    AppEventManager.get(new AppEvent(tempstor.get(req, AppEventManager.ENTITY)), callback);
};

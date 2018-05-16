let {AppEntity, AppEntityManager} = require("../app/phantom");
const tempstor = require('estorm-tempstor');

/**
 * GET LIST OF APP ENTITIES
 */
module.exports.list = function (req, res, callback) {
    AppEntityManager.list(new AppEntity(tempstor.get(req, AppEntityManager.ENTITY)), callback);
};

/**
 * CREATE APP ENTITY
 */
module.exports.create = function (req, res, callback) {
    AppEntityManager.create(new AppEntity(tempstor.get(req, AppEntityManager.ENTITY)), callback);
};

/**
 * DELETE EXIST APP ENTITY
 */
module.exports.delete = function (req, res, callback) {
    AppEntityManager.remove(new AppEntity(tempstor.get(req, AppEntityManager.ENTITY)), callback);
};

/**
 * DELETE APP ENTITY BY COUNTRY
 */
module.exports.deleteByCountry = function (req, res, callback) {
    let country_id = tempstor.get(req, AppEntityManager.ENTITY).country_id;
    AppEntityManager.removeByCountry(country_id, callback);
};

/**
 * UPDATE EXIST APP ENTITY
 */
module.exports.update = function (req, res, callback) {
    AppEntityManager.update(new AppEntity(tempstor.get(req, AppEntityManager.ENTITY)), callback);
};

/**
 * UPDATE EXIST APP ENTITY
 */
module.exports.updateForward = function (app, callback) {
    AppEntityManager.update(new AppEntity(app), callback);
};

/**
 * GET LIST BY QUEUE
 */
module.exports.getByQueue = function (req, res, callback) {
    let appEntity = tempstor.get(req, AppEntityManager.ENTITY);
    console.log(appEntity.type);
    AppEntityManager.oneByOrder({type: appEntity.type}, {ptime: 1}, callback);
};

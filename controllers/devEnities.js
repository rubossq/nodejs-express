let {DevEntity, DevEntityManager} = require("../app/phantom");
const tempstor = require('estorm-tempstor');

/**
 * GET LIST OF EXIST DEV ENTITIES
 */
module.exports.list = function (req, res, callback) {
    DevEntityManager.list(new DevEntity(tempstor.get(req, DevEntityManager.ENTITY)), callback);
};

/**
 * CREATE NEW DEV ENTITY
 */
module.exports.create = function (req, res, callback) {
    DevEntityManager.create(new DevEntity(tempstor.get(req, DevEntityManager.ENTITY)), callback);
};

/**
 * DELETE EXIST DEV ENTITY
 */
module.exports.delete = function (req, res, callback) {
    DevEntityManager.remove(new DevEntity(tempstor.get(req, DevEntityManager.ENTITY)), callback);
};

/**
 * DELETE DEV ENTITY BY COUNTRY
 */
module.exports.deleteByCountry = function (req, res, callback) {
    let country_id = tempstor.get(req, DevEntityManager.ENTITY).country_id;
    DevEntityManager.removeByCountry(country_id, callback);
};

/**
 * UPDATE EXIST DEV ENTITY
 */
module.exports.update = function (req, res, callback) {
    DevEntityManager.update(new DevEntity(tempstor.get(req, DevEntityManager.ENTITY)), callback);
};

/**
 * GET DEV ENTITY BY QUEUE
 */
module.exports.getByQueue = function (req, res, callback) {
    DevEntityManager.oneByOrder({}, {ptime: 1}, callback);
};

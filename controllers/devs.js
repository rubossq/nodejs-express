let {Dev, DevManager} = require("../app/devs");
const tempstor = require('estorm-tempstor');

/**
 * CREATE NEW DEV
 */
module.exports.create = function (req, res, callback) {
    DevManager.create(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

/**
 * DELETE EXIST DEV
 */
module.exports.delete = function (req, callback) {
    DevManager.remove(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

/**
 * UPDATE EXIST DEV
 */
module.exports.update = function (req, res, callback) {
    DevManager.update(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

module.exports.updatePtime = function (req, res, callback) {
    DevManager.updatePtime(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

/**
 * GET DEV BY QUEUE
 */
module.exports.getByQueue = function (req, res, callback) {
    DevManager.oneByOrder({}, {ptime: 1}, callback);
};

/**
 * GET LIST OF EXIST DEVS
 */
module.exports.list = function (req, res, callback) {
    let dev = tempstor.get(req, DevManager.ENTITY);
    DevManager.list({}, parseInt(dev.skip), parseInt(dev.limit), callback);
};

module.exports.listByName = function(req, res, callback){
    let dev = tempstor.get(req, DevManager.ENTITY);
    let reg = new RegExp([dev.name], "i");
    DevManager.list({name: reg}, parseInt(dev.skip), parseInt(dev.limit), callback);
};

/**
 * GET CERTAIN DEV BY ID
 */
module.exports.info = function (req, res, callback) {
    DevManager.info(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

/**
 * GET CERTAIN DEV BY URL
 */
module.exports.get = function (req, res, callback) {
    DevManager.get(new Dev(tempstor.get(req, DevManager.ENTITY)), callback);
};

module.exports.getForward = function (dev, callback) {
    DevManager.get(new Dev(dev), callback);
};



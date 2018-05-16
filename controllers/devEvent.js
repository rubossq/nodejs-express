let {DevEvent, DevEventManager} = require("../app/devevent");
let tempstor = require("estorm-tempstor");

/**
 * CREATE NEW DEV EVENT
 */
module.exports.create = function (req, res, callback) {
    DevEventManager.create(new DevEvent(tempstor.get(req, DevEventManager.ENTITY)), callback || function () {
    });
};

module.exports.createForward = function (devEvent, callback) {
    DevEventManager.create(new DevEvent(devEvent), callback || function () {
    });
};

/**
 * DELETE EXIST DEV EVENT
 */
module.exports.delete = function (req, res, callback) {
    DevEventManager.remove(new DevEvent(tempstor.get(req, DevEventManager.ENTITY)), callback);
};

module.exports.clean = function (req, res, callback) {
    DevEventManager.removeByQuery({etime: {$lte: tempstor.get(req, DevEventManager.ENTITY).etime}}, callback);
};

/**
 * UPDATE EXIST DEV EVENT
 */
module.exports.update = function (req, res, callback) {
    DevEventManager.update(new DevEvent(tempstor.get(req, DevEventManager.ENTITY)), callback);
};

/**
 * GET LIST OF EXIST DEV EVENTS
 */
module.exports.list = function (req, res, callback) {
    DevEventManager.list({}, callback);
};

module.exports.listByDev = function (req, res, callback) {
    let devEvent = tempstor.get(req, DevEventManager.ENTITY);
    DevEventManager.count({dev_id: "" + devEvent.dev_id},
        {_id: "$type", count: {$sum: 1}}, devEvent, callback);
};

/**
 * GET CERTAIN DEV EVENT BY ID
 */
module.exports.info = function (req, res, callback) {
    DevEventManager.info(new DevEvent(tempstor.get(req, DevEventManager.ENTITY)), callback);
};

/**
 * GET CERTAIN DEV EVENT BY URL
 */
module.exports.get = function (req, res, callback) {
    DevEventManager.get(new DevEvent(tempstor.get(req, DevEventManager.ENTITY)), callback);
};

let {App, AppManager} = require("../app/apps");
let ObjectID = require('mongodb').ObjectID;
const tempstor = require('estorm-tempstor');

/**
 * CREATE NEW APP
 */
module.exports.create = function(req, res, callback){
    let app = new App(tempstor.get(req, AppManager.ENTITY));
    app.prepare();
    AppManager.create(app, callback);
};

module.exports.createForward = function(app_data, callback){
    let app = new App(app_data);
    app.prepare();
    AppManager.create(app, callback);
};

/**
 * DELETE EXIST APP
 */
module.exports.delete = function(req, callback){
    AppManager.remove(new App(tempstor.get(req, AppManager.ENTITY)), callback);
};

/**
 * UPDATE EXIST APP
 */
module.exports.update = function(req, res, callback){
    let app = new App(tempstor.get(req, AppManager.ENTITY));
    app.prepare();
    AppManager.update(app, callback);
};

module.exports.updatePtime = function(req, res, callback){
    AppManager.updatePtime(new App(tempstor.get(req, AppManager.ENTITY)), callback);
};

/**
 * GET APP BY QUEUE
 */
module.exports.getByQueue = function(req, res, callback){
    AppManager.oneByOrder({}, {ptime: 1}, callback);
};

/**
 * GET LIST OF EXIST APPS
 */
module.exports.list = function(req, res, callback){
    let app = tempstor.get(req, AppManager.ENTITY);
    AppManager.listControl({name: { $ne : null }}, parseInt(app.skip), parseInt(app.limit), callback);
};

module.exports.listByName = function(req, res, callback){
    let app = tempstor.get(req, AppManager.ENTITY);
    let reg = new RegExp([app.name], "i");
    AppManager.listControl({name: reg}, parseInt(app.skip), parseInt(app.limit), callback);
};

/**
 * GET LIST OF TARGET APPS
 */
module.exports.targetList = function(req, res, callback){
    let app = tempstor.get(req, AppManager.ENTITY);
    let ids = [];

    for(let i=0; i<app.ids.length; i++){
        ids.push(new ObjectID(app.ids[i]));
    }

    AppManager.list({_id : {$in: ids}, name: { $ne : null }}, callback);
};

module.exports.listByDeveloperForward = function(system_developer_id, callback){
    AppManager.list({system_developer_id: system_developer_id + '', name: { $ne : null }}, callback);
};

/**
 * GET CERTAIN APP BY ID
 */
module.exports.info = function(req, res, callback){
    AppManager.info(new App(tempstor.get(req, AppManager.ENTITY)), callback);
};

/**
 * GET CERTAIN APP BY URL
 */
module.exports.get = function(req, res, callback){
    AppManager.get(new App(tempstor.get(req, AppManager.ENTITY)), callback);
};

module.exports.getForward = function(app, callback){
    AppManager.get(new App(app), callback);
};

let express = require('express');
let router = express.Router();
let async = require("async");
const tempstor = require('estorm-tempstor');

let {AppEntityManager, AppEntityType, DevEntityManager} = require("../../app/phantom");
let {AppManager} = require("../../app/apps");
let {DevManager} = require("../../app/devs");
let {AppEventManager, AppEventType} = require("../../app/appevent");
let {DevEventManager, DevEventType} = require("../../app/devevent");
let {RankingManager} = require("../../app/ranking");

let appEntitiesController = require("../../controllers/appEnities");
let devEntitiesController = require("../../controllers/devEnities");
let appsController = require("../../controllers/apps");
let devsController = require("../../controllers/devs");

let appEventController = require("../../controllers/appEvent");
let devEventController = require("../../controllers/devEvent");

router.post('/phantom/apps/ranking', function (req, res, next) {

    let apps = req.body.apps;

    let date = new Date();
    let ptime = parseInt(date.getTime() / 1000);

    for (let i = 0; i < apps.length; i++) {
        apps[i].ptime = ptime;
        apps[i].country_id = req.body.country_id;
        apps[i].type = AppEntityType.LIST;
    }

    //here may be bug because of req data and async
    async.map(apps, function (app, cb) {
        getAppId(app, function (app_id, appObj) {
            makeAppEvent(app_id, AppEventType.RANKING, {status: "ok", country_id: app.country_id, rank: app.rank});

            if(!appObj || ptime - appObj.getPtime() < 86400 ){
                appEntitiesController.updateForward(app, function (err) {});
            }

            cb(null);
        });
    }, function (err) {
        if (err) {
            res.json({status: "err", message: "Updating error"});
        } else {
            res.json({status: "ok"});
        }
    });
});

router.post('/phantom/apps/developer', function (req, res, next) {

    let apps = req.body.apps;

    let date = new Date();
    let ptime = parseInt(date.getTime() / 1000);

    for (let i = 0; i < apps.length; i++) {
        apps[i].ptime = ptime;
        apps[i].type = AppEntityType.DEVELOPER;
    }

    async.map(apps, function (app, cb) {
        getAppId(app, function (app_id, appObj) {

            if(!appObj || ptime - appObj.getPtime() < 86400 ){
                appEntitiesController.updateForward(app, function (err) {});
            }
            cb(null);
        });
    }, function (err) {
        if (err) {
            console.log(err);
            res.json({status: "err", message: "Updating error"});
        } else {
            res.json({status: "ok"});
        }
    });
});

function makeAppEvent(app_id, event_type, data) {
    let appEvent = {};
    appEvent.type = event_type;
    appEvent.app_id = app_id + '';

    let date = new Date();
    appEvent.etime = parseInt(date.getTime() / 1000);
    appEvent.data = data;
    appEventController.createForward(appEvent, null);
}

function makeDevEvent(dev_id, event_type, data) {
    let devEvent = {};
    devEvent.type = event_type;
    devEvent.dev_id = dev_id + '';

    let date = new Date();
    devEvent.etime = parseInt(date.getTime() / 1000);
    devEvent.data = data;
    devEventController.createForward(devEvent, null);
}

function getAppId(app, callback) {
    appsController.getForward(app, function (err, applicationObj) {
        if (err) {
            appsController.createForward(app, function (err, id) {
                if (err) {
                    console.log(err);
                    res.json({status: "err", message: "Create app error"});
                } else {
                    callback(id);
                }
            });
        } else {
            callback(applicationObj.getId(), applicationObj);
        }
    });
}

router.get('/phantom/app/get', function (req, res, next) {
    tempstor.set(req, AppEntityManager.ENTITY, {type: AppEntityType.LIST});

    appEntitiesController.getByQueue(req, res, function (err, apps) {
        if (err) {
            console.log(err);
            res.json({status: "err", message: "Load list type error"});
        } else {
            if (apps.length > 0) {
                tempstor.set(req, AppEntityManager.ENTITY, {id: apps[0].getId()});
                appEntitiesController.delete(req, res, function () {
                    res.json({status: "ok", package_id: apps[0].getPackageId()});
                });
            } else {
                tempstor.set(req, AppEntityManager.ENTITY, {type: AppEntityType.DEVELOPER});
                appEntitiesController.getByQueue(req, res, function (err, apps) {
                    if (err) {
                        console.log(err);
                        res.json({status: "err", message: "Load Developer type error"});
                    } else {
                        if (apps.length > 0) {
                            tempstor.set(req, AppEntityManager.ENTITY, {id: apps[0].getId()});
                            appEntitiesController.delete(req, res, function () {
                                res.json({status: "ok", package_id: apps[0].getPackageId()});
                            });
                        } else {
                            appsController.getByQueue(req, res, function (err, apps) {
                                if (err) {
                                    console.log(err);
                                    res.json({status: "err", message: "Load update type error"});
                                } else {
                                    if (apps.length > 0) {
                                        let date = new Date();
                                        tempstor.set(req, AppManager.ENTITY, {
                                            id: apps[0].getId(),
                                            ptime: parseInt(date.getTime() / 1000)
                                        });
                                        appsController.updatePtime(req, res, function () {
                                            res.json({status: "ok", package_id: apps[0].getPackageId()});
                                        });
                                    } else {
                                        res.json({status: "err", message: "There are no apps to parse"});
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

router.post('/phantom/app/update', function (req, res, next) {

    tempstor.set(req, AppManager.ENTITY, req.body.app);
    let app = tempstor.get(req, AppManager.ENTITY);

    let date = new Date();
    let ptime = parseInt(date.getTime() / 1000);

    if (req.body.status === "ok") {

        req.body.developer.ptime = ptime;
        tempstor.set(req, DevManager.ENTITY, req.body.developer);

        tempstor.set(req, DevEntityManager.ENTITY, req.body.developer);
        devEntitiesController.update(req, res, function (err) {
        });

        getDevId(req, res, function (devId) {
            app.system_developer_id = devId + '';
            app.ptime = ptime;
            tempstor.set(req, AppManager.ENTITY, app);
            appsController.get(req, res, function (err, applicationObj) {
                let isNew = true;
                if (applicationObj) {
                    app.id = applicationObj.getId();
                    let updates = applicationObj.getUpdates();
                    if (updates) {
                        if (updates !== app.updates) {
                            makeDevEvent(applicationObj.getSystemDeveloperId(), DevEventType.UPDATE_APP, {status: "ok"});
                            makeAppEvent(applicationObj.getId(), AppEventType.UPDATE, {
                                status: "ok",
                                date: app.updates,
                                version: app.version
                            });
                        }

                        isNew = false;
                        let downloads = applicationObj.getDownloads();
                        if (downloads && downloads !== app.downloads) {
                            makeAppEvent(applicationObj.getId(), AppEventType.DOWNLOADS, {
                                status: "ok",
                                downloads: app.downloads
                            });
                        }
                    }
                }

                appsController.update(req, res, function (err, appId) {
                    console.log(err);
                    if (err) {
                        res.json({status: "err", message: "Update app error"});
                    } else {
                        if (isNew) {
                            makeDevEvent(devId, DevEventType.NEW_APP, {status: "ok"});
                            makeAppEvent(appId, AppEventType.NEW, {status: "ok"});
                            makeAppEvent(appId, AppEventType.UPDATE, {
                                status: "ok",
                                date: app.updates,
                                version: app.version
                            });
                            makeAppEvent(appId, AppEventType.DOWNLOADS, {status: "ok", downloads: app.downloads});
                        }

                        let markOne = parseInt(app.rating.one);
                        let markTwo = parseInt(app.rating.two);
                        let markThree = parseInt(app.rating.three);
                        let markFour = parseInt(app.rating.four);
                        let markFive = parseInt(app.rating.five);

                        let total = markOne + markTwo + markThree + markFour + markFive;

                        let avrating = ((markOne + markTwo * 2 + markThree * 3 + markFour * 4 + markFive * 5) / total).toFixed(2);

                        makeAppEvent(appId, AppEventType.RATING, {status: "ok", rating: avrating});
                        res.json({status: "ok"});
                    }
                });
            });
        });
    } else {
        //add app again to appEntities ???
        appsController.get(req, res, function (err, applicationObj) {
            if (applicationObj) {
                makeDevEvent(applicationObj.getSystemDeveloperId(), DevEventType.REMOVE_APP, {status: "ok"});
                makeAppEvent(applicationObj.getId(), AppEventType.REMOVE, {status: "ok"});

            }
            res.json({status: "ok"});
        });
    }
});

function getDevId(req, res, callback) {
    devsController.get(req, res, function (err, devObj) {
        if (err) {
            devsController.update(req, res, function (err, id) {
                if (err) {
                    console.log(err);
                    res.json({status: "err", message: "Create dev error"});
                } else {
                    callback(id);
                }
            });
        } else {
            callback(devObj.getId());
        }
    });
}

router.get('/phantom/dev/get', function (req, res, next) {

    devEntitiesController.getByQueue(req, res, function (err, devs) {
        if (err) {
            console.log(err);
            res.json({status: "err", message: "Load Developer list error"});
        } else {
            if (devs.length > 0) {
                tempstor.set(req, DevEntityManager.ENTITY, {id: devs[0].getId()});
                devEntitiesController.delete(req, res, function () {
                    res.json({status: "ok", dev_id: devs[0].getStoreDevId()});
                });
            } else {
                devsController.getByQueue(req, res, function (err, devs) {
                    if (err) {
                        console.log(err);
                        res.json({status: "err", message: "Load update type error"});
                    } else {
                        if (devs.length > 0) {
                            let date = new Date();
                            tempstor.set(req, DevManager.ENTITY, {
                                id: devs[0].getId(),
                                ptime: parseInt(date.getTime() / 1000)
                            });
                            devsController.updatePtime(req, res, function () {
                                res.json({status: "ok", dev_id: devs[0].getStoreDevId()});
                            });
                        } else {
                            res.json({status: "err", message: "There are no devs to parse"});
                        }
                    }
                });
            }
        }
    });
});

router.get('/hype/snapshot', function (req, res, next) {

    getCurrentHypes(function (err, apps) {
        apps.forEach(function (value, key, map) {
            makeAppEvent(key, AppEventType.HYPE, {status: "ok", hype: value});
        });
        res.json({status: "ok"});
    });
});

router.get('/events/clean', function (req, res, next) {

    let date = new Date();
    //3 month
    let etime = parseInt(date.getTime() / 1000) - 90 * 86400;
    tempstor.set(req, AppEventManager.ENTITY, {etime: etime});
    tempstor.set(req, DevEventManager.ENTITY, {etime: etime});
    appEventController.clean(req, res, function (err, result) {
        devEventController.clean(req, res, function (err, result) {
            res.json({status: "ok"});
        });
    });

});

function getCurrentHypes(callback) {

    let intervalObj = RankingManager.getCurrentInterval();

    let appEvent = {
        start: intervalObj.start,
        end: intervalObj.end,
        type: AppEventType.RANKING
    };

    appEventController.listRankingForward(appEvent, function (err, events) {
        let apps = RankingManager.countIntervalHype(events);

        callback(null, apps);
    });
}

module.exports = router;
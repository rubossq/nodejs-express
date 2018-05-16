let express = require('express');
let router = express.Router();
let devsController = require("../controllers/devs");
let appsController = require("../controllers/apps");

let devEventController = require("../controllers/devEvent");

const {PermissionsManager} = require("estorm-permissions");
const crumbs = require("estorm-crumbs");

const {DevManager} = require('../app/devs');

let {DevEventManager, DevEventType} = require("../app/devevent");

const tempstor = require('estorm-tempstor');
const async = require('async');

const Charts = require("estorm-charts");

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, DevManager.ENTITY, req.query);

    let dev = tempstor.get(req, DevManager.ENTITY);

    dev.limit = 20;


    if(dev.next){
        dev.skip +=  dev.limit;
    }else if(dev.prev){
        dev.skip -=  dev.limit;
    }

    if(!dev.skip || dev.skip < 0){
        dev.skip = 0;
    }

    console.log(dev.skip + " " + dev.limit);

    let action = devsController.list;
    if(dev.name){
        action = devsController.listByName;
    }

    action(req, res, function (err, devslist) {
        if (err) {
            next(err);
        } else {
            async.map(devslist, function (dev, cb) {
                appsController.listByDeveloperForward(dev.getId(), function (err, appslist) {
                    if (err) {
                        cb(err);
                    } else {
                        let downloads = 0;
                        let av = 0;

                        for (let i = 0; i < appslist.length; i++) {
                            downloads += appslist[i].getDownloads();
                            av += parseFloat(appslist[i].getRating().av);
                        }

                        let rating = (av / appslist.length).toFixed(2);
                        if (isNaN(rating)) {
                            rating = 0;
                        }

                        dev.additional = {
                            rating: rating,
                            apps: appslist.length,
                            downloads: downloads
                        };

                        cb(null, dev);
                    }
                });
            }, function (err, result) {
                res.render('pages/devs/index', {title: 'Dev list', devs: result});
            });
        }
    });
});

// GET add new dev
router.get('/create', PermissionsManager.check([PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {
    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }
    crumbs.pushForward("Create dev", res.locals.routePath + "/create", res);
    let cancelLink = res.locals.routePath;

    res.render('pages/devs/edit', {
        title: 'Create new dev',
        isNotValidate: isNotValidate,
        message: message,
        cancelLink: cancelLink
    });
});

// GET dev by ID
router.get('/:id', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, DevManager.ENTITY, req.params);

    let devReq = tempstor.get(req, DevManager.ENTITY);

    devReq.start = req.query.start || null;
    devReq.end = req.query.end || null;

    devsController.info(req, res, function (err, dev) {
        if (err) {
            next(err);
        } else {
            crumbs.pushForward(dev.name, res.locals.routePath + "/" + dev.id, res);
            appsController.listByDeveloperForward(dev.getId(), function (err, appslist) {
                if (err) {
                    cb(err);
                } else {
                    let downloads = 0;
                    let av = 0;

                    for (let i = 0; i < appslist.length; i++) {
                        downloads += appslist[i].getDownloads();
                        av += parseFloat(appslist[i].getRating().av);
                    }

                    let rating = (av / appslist.length).toFixed(2);
                    if (isNaN(rating)) {
                        rating = 0;
                    }

                    dev.additional = {
                        rating: rating,
                        apps: appslist.length,
                        downloads: downloads
                    };

                    let preparedDates = Charts.prepareDates(devReq);

                    if (preparedDates.status === 'ok') {
                        tempstor.set(req, DevEventManager.ENTITY, {
                            dev_id: devReq.id,
                            interval: Charts.getInterval(preparedDates)
                        });

                        //async get views, clicks, loads
                        //how to draw a charts
                        devEventController.listByDev(req, res, function (err, events) {
                            let devDataMap = new Map();

                            for (let j = 0; j < events.length; j++) {

                                let currentIntervalGroups = events[j].res;
                                if (!devDataMap.has(events[j].number)) {
                                    devDataMap.set(events[j].number, [events[j].number, 0, 0, 0]);
                                }

                                for (let i = 0; i < currentIntervalGroups.length; i++) {
                                    switch (currentIntervalGroups[i]._id) {
                                        case DevEventType.NEW_APP:
                                            devDataMap.get(events[j].number)[1] = currentIntervalGroups[i].count;
                                            break;
                                        case DevEventType.UPDATE_APP:
                                            devDataMap.get(events[j].number)[2] = currentIntervalGroups[i].count;
                                            break;
                                        case DevEventType.REMOVE_APP:
                                            devDataMap.get(events[j].number)[3] = currentIntervalGroups[i].count;
                                            break;
                                    }
                                }
                            }

                            let devReleasesData = [["Part", "Releases"]];
                            let devUpdatesData = [["Part", "Updates"]];
                            let devRemovesData = [["Part", "Removes"]];

                            devDataMap.forEach(function (value, key, map) {
                                devReleasesData.push([value[0], value[1]]);
                                devUpdatesData.push([value[0], value[2]]);
                                devRemovesData.push([value[0], value[3]]);
                            });

                            res.render('pages/devs/dev', {
                                title: 'Dev', dev: dev, apps: appslist,
                                devReleasesData: JSON.stringify(devReleasesData),
                                devUpdatesData: JSON.stringify(devUpdatesData),
                                devRemovesData: JSON.stringify(devRemovesData),
                                start: devReq.start,
                                end: devReq.end
                            });
                        });
                    } else {
                        res.render('pages/devs/dev', {
                            title: 'Dev',
                            dev: dev,
                            apps: appslist,
                            isNotValidate: true,
                            message: message,
                            start: null,
                            end: null
                        });
                    }
                }
            });
        }
    });
});

/**
 * create new dev
 * or update exist dev
 * with checking validation
 */
router.post('/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]),
    function (req, res, next) {
        res.redirect("/");
    });

// POST delete dev
router.post('/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, DevManager.ENTITY, req.params);

    devsController.delete(req, function (err, count) {
        if (err) {
            next(err);
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;

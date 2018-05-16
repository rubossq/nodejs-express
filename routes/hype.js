let express = require('express');
let router = express.Router();
let appsController = require("../controllers/apps");

const {PermissionsManager} = require("estorm-permissions");

const {AppManager} = require('../app/apps');

const tempstor = require('estorm-tempstor');

let appEventController = require("../controllers/appEvent");
let {AppEventManager, AppEventType} = require("../app/appevent");
let {RankingManager} = require("../app/ranking");

const async = require("async");

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppEventManager.ENTITY, req.query);
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);

    if (!appEvent.period) {
        appEvent.period = "0d";
    }

    let offset = parseInt(appEvent.period) * 86400;
    getCurrentHypes(offset, function (err, apps) {
        tempstor.set(req, AppManager.ENTITY, {ids: Array.from(apps.keys())});

        appsController.targetList(req, res, function (err, list) {
            if (err) {
                next(err);
            } else {
                for (let i = 0; i < list.length; i++) {
                    list[i].setHype(apps.get("" + list[i].getId()));
                }

                list.sort(function (a, b) {
                    return (a.hype > b.hype) ? -1 : ((b.hype > a.hype) ? 1 : 0);
                });
                console.log(list);
                res.render('pages/hype/apps', {title: 'Hype list', apps: list});
            }
        });
    });
});

router.get('/growth', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppEventManager.ENTITY, req.query);
    let appEvent = tempstor.get(req, AppEventManager.ENTITY);

    if (!appEvent.period) {
        appEvent.period = "1d";
    }

    let offset = parseInt(appEvent.period) * 86400;

    async.parallel({
        before: wrapCurrentHypes(offset),
        now: wrapCurrentHypes()
    }, function (err, results) {
        let apps = new Map();

        results.now.forEach(function (currentHype, key, map) {
            let oldHype = results.before.get(key);
            let diff = currentHype;
            if (oldHype) {
                diff -= oldHype;
            }

            apps.set(key, {hype: currentHype, diff: diff});
        });

        tempstor.set(req, AppManager.ENTITY, {ids: Array.from(apps.keys())});

        appsController.targetList(req, res, function (err, list) {
            if (err) {
                next(err);
            } else {
                for (let i = 0; i < list.length; i++) {
                    let val = apps.get("" + list[i].getId());
                    list[i].setHype(val.hype);
                    list[i].diff = val.diff;
                }

                list.sort(function (a, b) {
                    return (a.diff > b.diff) ? -1 : ((b.diff > a.diff) ? 1 : 0);
                });
                res.render('pages/hype/growth', {title: 'Growth list', apps: list});
            }
        });
    });
});

function wrapCurrentHypes(offset) {
    return function (callback) {
        getCurrentHypes(offset, callback);
    }
}

function getCurrentHypes(offset, callback) {
    let intervalObj = RankingManager.getCurrentInterval(offset);

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

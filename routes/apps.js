let express = require('express');
let router = express.Router();
let appsController = require("../controllers/apps");

const {PermissionsManager} = require("estorm-permissions");
const crumbs = require("estorm-crumbs");

const {AppManager} = require('../app/apps');

const tempstor = require('estorm-tempstor');

const Charts = require("estorm-charts");
let appEventController = require("../controllers/appEvent");
let {AppEventManager, AppEventType} = require("../app/appevent");
let {RankingManager, RankingCountries} = require("../app/ranking");

const async = require("async");

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppManager.ENTITY, req.query);

    let app = tempstor.get(req, AppManager.ENTITY);

    app.limit = 20;
    app.skip = parseInt(app.skip);

    if (app.next) {
        app.skip += app.limit;
    } else if (app.prev) {
        app.skip -= app.limit;
    }

    if (!app.skip || app.skip < 0) {
        app.skip = 0;
    }


    let action = appsController.list;
    if (app.name) {
        action = appsController.listByName;
    }

    action(req, res, function (err, list) {
        if (err) {
            next(err);
        } else {
            res.render('pages/apps/index', {title: 'App list', apps: list, name: app.name, skip: app.skip});
        }
    });


});

// GET list by countries
router.get('/ranking', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppManager.ENTITY, req.query);

    let ranking = tempstor.get(req, AppManager.ENTITY);


    let countries = RankingCountries.COUNTRIES;

    if (!ranking.country_id) {
        ranking.country_id = RankingCountries.UNITED_STATES;
    }

    let intervalObj = RankingManager.getCurrentInterval();

    let appEvent = {
        start: intervalObj.start,
        end: intervalObj.end,
        country_id: ranking.country_id,
        type: AppEventType.RANKING
    };

    appEventController.listRankingByCountryForward(appEvent, function(err, events){
        if(err){
            next(err);
        }else{

            let apps = RankingManager.countCountryRankings(events);
            tempstor.set(req, AppManager.ENTITY, {ids: Array.from(apps.keys())});

            appsController.targetList(req, res, function (err, list) {
                if (err) {
                    next(err);
                } else {
                    for (let i = 0; i < list.length; i++) {
                        list[i].rank = parseInt(apps.get("" + list[i].getId()));
                    }

                    list.sort(function (a, b) {
                        return (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0);
                    });

                    res.render('pages/apps/ranking', {title: 'App list', countries: countries, country_id: ranking.country_id, apps: list});
                }
            });


        }
    });

})
;

// GET add new app
router.get('/create', PermissionsManager.check([PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {
    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }
    crumbs.pushForward("Create app", res.locals.routePath + "/create", res);
    let cancelLink = res.locals.routePath;
    res.render('pages/apps/edit', {
        title: 'Create new app',
        isNotValidate: isNotValidate,
        message: message,
        cancelLink: cancelLink
    });
});

// GET app by ID
router.get('/:id', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppManager.ENTITY, req.params);
    let appReq = tempstor.get(req, AppManager.ENTITY);

    appsController.info(req, res, function (err, app) {
        if (err) {
            next(err);
        } else {
            crumbs.pushForward(app.name, res.locals.routePath + "/" + app.id, res);

            const date = setDate(req.query);
            appReq.rating = date;
            appReq.ranking = date;
            appReq.downloads = date;

            async.parallel({
                updates: getUpdatesData(req, res, appReq),
                rating: getRatingData(req, res, appReq),
                ranking: getRankingData(req, res, appReq, true),
                downloads: getDownloadsData(req, res, appReq),
                currentRankingInfo: getCurrentRanking(req, res, appReq)
            }, function (err, results) {
                res.render('pages/apps/app', {
                    title: 'App', app: app,
                    updates: results.updates,
                    appRatingData: JSON.stringify(results.rating),
                    ranking: results.ranking,
                    appDownloadsData: JSON.stringify(results.downloads),
                    currentRankingInfo: results.currentRankingInfo,
                    downloadsDate: appReq.downloads,
                    ratingDate: appReq.rating,
                    rankingDate: appReq.ranking
                });
            });
        }
    });
});

function setDate(query) {
    if (!query.rating || (!query.rating.start && !query.rating.end)) {
        if (!query.ranking || (!query.ranking.start && !query.ranking.end)) {
            if (!query.downloads || (!query.downloads.start && !query.downloads.end)) {
                return {};
            } else {
                return {start: query.downloads.start, end: query.downloads.end};
            }
        } else {
            return {start: query.ranking.start, end: query.ranking.end};
        }
    } else {
        return {start: query.rating.start, end: query.rating.end};
    }
}


function getUpdatesData(req, res, appReq) {
    return function (callback) {
        let appEvent = {
            app_id: appReq.id,
            type: AppEventType.UPDATE
        };

        appEventController.listEventsByTypeForward(appEvent, function (err, list) {
            let updates = [];
            for (let i = 0; i < list.length; i++) {
                updates.push(list[i].getData());
            }
            callback(err, updates);
        });
    }
}

function getRankingData(req, res, appReq, needJSON) {
    return function (callback) {
        let preparedDates = Charts.prepareDates(appReq.ranking || {});

        let countries = [];

        if (preparedDates.status === 'ok') {
            let appEvent = {
                app_id: appReq.id,
                interval: Charts.getInterval(preparedDates),
                type: AppEventType.RANKING
            };

            appEventController.listByAppRankingForward(appEvent, function (err, events) {
                let rankingData = ["Part"];
                let rankingDataMap = new Map();

                for (let j = 0; j < events.length; j++) {

                    let currentIntervalGroups = events[j].res;
                    if (!rankingDataMap.has(events[j].number)) {
                        rankingDataMap.set(events[j].number, [events[j].number]);
                    }

                    for (let i = 0; i < currentIntervalGroups.length; i++) {
                        if (currentIntervalGroups) {
                            let dataArr = rankingDataMap.get(events[j].number);
                            let index = rankingData.indexOf(currentIntervalGroups[i]._id);
                            if (index === -1) {
                                index = rankingData.push(currentIntervalGroups[i]._id) - 1;
                            }

                            dataArr[index] = currentIntervalGroups[i].rank;
                        }
                    }
                }

                let countriesMap = new Map();

                rankingDataMap.forEach(function (value, key, map) {
                    for (let i = 1; i < rankingData.length; i++) {
                        if (value[i]) {
                            if (!countriesMap.has(rankingData[i])) {
                                countriesMap.set(rankingData[i], [["Part", rankingData[i]], [value[0], value[i]]]);
                            } else {
                                countriesMap.get(rankingData[i]).push([value[0], value[i]]);
                            }
                        }

                    }
                });

                countries = Array.from(countriesMap.values());

                if (needJSON) {
                    for (let i = 0; i < countries.length; i++) {
                        countries[i] = JSON.stringify(countries[i]);
                    }
                }

                console.log(countries);

                callback(null, countries);
            });
        } else {
            callback(null, countries);
        }
    }
}

function getCurrentRanking(req, res, appReq) {
    return function (callback) {
        let countries = [];

        let intervalObj = RankingManager.getCurrentInterval();

        let appEvent = {
            app_id: appReq.id,
            start: intervalObj.start,
            end: intervalObj.end,
            type: AppEventType.RANKING
        };

        appEventController.listByAppRankingRowsForward(appEvent, function (err, events) {
            for (let j = 0; j < events.length; j++) {
                let currentIntervalGroups = events[j];

                if (currentIntervalGroups) {
                    countries.push({country_id: currentIntervalGroups._id, rank: currentIntervalGroups.rank});
                }
            }

            countries.sort(function (a, b) {
                return (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0);
            });

            callback(null, countries.length > 0 ? countries : false);
        });
    }
}

function getDownloadsData(req, res, appReq) {
    return function (callback) {
        let preparedDates = Charts.prepareDates(appReq.downloads || {});

        let appDownloadsData = [["Part", "Downloads"]];

        if (preparedDates.status === 'ok') {
            let appEvent = {
                app_id: appReq.id,
                interval: Charts.getInterval(preparedDates),
                type: AppEventType.DOWNLOADS,
                _id: "data.downloads"
            };

            appEventController.eventsPeriodForward(appEvent, function (err, events) {
                let appDataMap = new Map();

                for (let j = 0; j < events.length; j++) {

                    let currentIntervalGroups = events[j].res;
                    if (!appDataMap.has(events[j].number)) {
                        appDataMap.set(events[j].number, [events[j].number, 0]);
                    }

                    if (currentIntervalGroups) {
                        appDataMap.get(events[j].number)[1] = currentIntervalGroups.getData().downloads;
                    }
                }

                appDataMap.forEach(function (value, key, map) {
                    appDownloadsData.push([value[0], value[1]]);
                });

                callback(null, appDownloadsData);
            });
        } else {
            callback(null, appDownloadsData);
        }
    }
}

function getRatingData(req, res, appReq) {
    return function (callback) {
        let preparedDates = Charts.prepareDates(appReq.rating || {});

        let appRatingData = [["Part", "Rating"]];

        if (preparedDates.status === 'ok') {
            let appEvent = {
                app_id: appReq.id,
                interval: Charts.getInterval(preparedDates),
                type: AppEventType.RATING,
                _id: "data.rating"
            };

            //async get views, clicks, loads
            //how to draw a charts
            appEventController.eventsPeriodForward(appEvent, function (err, events) {
                let appDataMap = new Map();

                for (let j = 0; j < events.length; j++) {
                    let currentIntervalGroups = events[j].res;
                    if (!appDataMap.has(events[j].number)) {
                        appDataMap.set(events[j].number, [events[j].number, 0]);
                    }

                    if (currentIntervalGroups) {
                        appDataMap.get(events[j].number)[1] = currentIntervalGroups.getData().rating;
                    }
                }

                appDataMap.forEach(function (value, key, map) {
                    appRatingData.push([value[0], value[1]]);
                });

                callback(null, appRatingData);
            });
        } else {
            callback(null, appRatingData);
        }
    }
}

/**
 * create new app
 * or update exist app
 * with checking validation
 */
router.post('/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]),
    function (req, res, next) {

        res.redirect("/");
    });

// POST delete app
router.post('/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, AppManager.ENTITY, req.params);

    appsController.delete(req, function (err, count) {
        if (err) {
            next(err);
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;

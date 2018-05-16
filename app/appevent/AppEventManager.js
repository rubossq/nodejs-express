let db = require("estorm-db").get();
let AppEvent = require("./AppEvent");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "appevent";

class AppEventManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(AppEventManager.ENTITY).createIndex({type: 1});
        db.collection(AppEventManager.ENTITY).createIndex({app_id: 1});
        db.collection(AppEventManager.ENTITY).createIndex({"data.rank": 1});
        db.collection(AppEventManager.ENTITY).createIndex({"data.rating": 1});
        db.collection(AppEventManager.ENTITY).createIndex({"data.downloads": 1});
        db.collection(AppEventManager.ENTITY).createIndex({"data.country_id": 1});
        db.collection(AppEventManager.ENTITY).createIndex({etime: 1});
    }

    static list(query, callback) {
        db.collection(AppEventManager.ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let appsEvent = new AppEvent(l);
                    cb(null, appsEvent);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static count(match, group, appsEvent, callback) {
        console.log(appsEvent);
        let intervals = [];
        let type = appsEvent.interval.type;
        let startTime = appsEvent.interval.start;
        let endTime = appsEvent.interval.end;

        let date = new Date(startTime * 1000);

        let dates = [];
        for (let i = 0; i <= appsEvent.interval.parts; i++) {
            if ((date.getTime() / 1000) >= endTime) {
                break;
            }

            let addSeconds = 0;
            if (type === "d") {
                dates.push(AppEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2));
                addSeconds = 86400;

            } else if (type === "h") {
                dates.push(AppEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2));
                addSeconds = 3600;
            }

            let start = date.getTime() / 1000;

            intervals.push({number: dates[i], start: start, end: start + addSeconds});

            date.setSeconds(date.getSeconds() + addSeconds);
        }

        async.map(intervals, function (interval, cb) {
            match.etime = {$gte: interval.start, $lte: interval.end};
            console.log(match);
            console.log(group);
            db.collection(AppEventManager.ENTITY).aggregate([
                {$match: match},
                {$group: group}
            ]).toArray(function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    interval.res = res;
                    cb(null, interval);
                }
            });
        }, function (err, results) {
            callback(err, results);
        });
    }

    static countForward(match, group, callback) {
        db.collection(AppEventManager.ENTITY).aggregate([
            {$match: match},
            {$group: group}
        ]).toArray(function (err, res) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, res);
            }
        });
    }

    static info(appsEvent, callback) {
        if (ObjectID.isValid(appsEvent.getId())) {
            db.collection(AppEventManager.ENTITY).findOne({
                _id: new ObjectID(appsEvent.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Apps Event not found"));
                } else {
                    let appsEvent = new AppEvent(res);
                    callback(null, appsEvent);
                }
            });
        } else {
            callback(new Error("Invalid appsEvent's id passed"));
        }
    }

    static maxPeriod(query, orderby, appEvent, callback) {
        let intervals = [];
        let type = appEvent.interval.type;
        let startTime = appEvent.interval.start;
        let endTime = appEvent.interval.end;

        let date = new Date(startTime * 1000);

        let dates = [];
        for (let i = 0; i <= appEvent.interval.parts; i++) {
            if ((date.getTime() / 1000) >= endTime) {
                break;
            }
            let addSeconds = 0;

            if (type === "d") {
                dates.push(AppEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2));
                addSeconds = 86400;

            } else if (type === "h") {
                dates.push(AppEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2));
                addSeconds = 3600;
            }

            let start = date.getTime() / 1000;

            intervals.push({number: dates[i], start: start, end: start + addSeconds});

            date.setSeconds(date.getSeconds() + addSeconds);
        }

        async.map(intervals, function (interval, cb) {
            query.etime = {$gte: interval.start, $lte: interval.end};

            db.collection(AppEventManager.ENTITY).find(query).sort(orderby).limit(1).toArray(function (err, res) {
                if (err || !res) {
                    cb(new Error("App Events not found"));
                } else {
                    if (res.length > 0) {
                        interval.res = new AppEvent(res[0]);
                    }

                    cb(null, interval);
                }
            });
        }, function (err, results) {
            callback(err, results);
        });
    }

    static get(appsEvent, callback) {
        db.collection(AppEventManager.ENTITY).findOne({name: appsEvent.getType()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Apps Event not found"));
            } else {
                let appsEvent = new AppEvent(res);
                callback(null, appsEvent);
            }
        });
    }

    static create(appsEvent, callback) {
        db.collection(AppEventManager.ENTITY).insertOne({
            app_id: appsEvent.getAppId(),
            etime: appsEvent.getEtime(),
            type: appsEvent.getType(),
            data: appsEvent.getData()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(appsEvent, callback) {
        if (ObjectID.isValid(appsEvent.getId())) {
            db.collection(AppEventManager.ENTITY).findOneAndUpdate({
                _id: new ObjectID(appsEvent.getId())
            }, {
                $set: {
                    etime: appsEvent.getEtime(),
                    app_id: appsEvent.getAppId(),
                    type: appsEvent.getType(),
                    data: appsEvent.getData()
                }
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    let lid = res.value._id;
                    callback(null, lid);
                }
            });
        } else {
            callback(new Error("Invalid appsEvent's id passed"));
        }
    }

    static remove(appsEvent, callback) {
        if (ObjectID.isValid(appsEvent.getId())) {
            db.collection(AppEventManager.ENTITY).deleteOne({
                _id: new ObjectID(appsEvent.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid appsEvent's id passed"));
        }
    }

    static removeByQuery(query, callback) {
        db.collection(AppEventManager.ENTITY).deleteMany(query, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.deletedCount);
            }
        });
    }

    static getWeekDay(i) {
        const weekDay = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        return weekDay[i];
    }
}

module.exports = AppEventManager;
let db = require("estorm-db").get();
let DevEvent = require("./DevEvent");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "devevent";

class DevEventManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(DevEventManager.ENTITY).createIndex({type: 1});
        db.collection(DevEventManager.ENTITY).createIndex({dev_id: 1});
        db.collection(DevEventManager.ENTITY).createIndex({etime: 1});
    }

    static list(query, callback) {
        db.collection(DevEventManager.ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let devEvent = new DevEvent(l);
                    cb(null, devEvent);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static count(match, group, devEvent, callback) {
        let intervals = [];
        let type = devEvent.interval.type;
        let startTime = devEvent.interval.start;
        let endTime = devEvent.interval.end;

        let date = new Date(startTime * 1000);

        let dates = [];
        for (let i = 0; i <= devEvent.interval.parts; i++) {
            if ((date.getTime() / 1000) >= endTime) {
                break;
            }

            let addSeconds = 0;

            if (type === "d") {
                dates.push(DevEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2));
                addSeconds = 86400;

            } else if (type === "h") {
                dates.push(DevEventManager.getWeekDay(date.getDay()) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2));
                addSeconds = 3600;
            }

            let start = date.getTime() / 1000;

            intervals.push({number: dates[i], start: start, end: start + addSeconds});

            date.setSeconds(date.getSeconds() + addSeconds);
        }

        async.map(intervals, function (interval, cb) {
            match.etime = {$gte: interval.start, $lte: interval.end};

            db.collection(DevEventManager.ENTITY).aggregate([
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

    static info(devEvent, callback) {
        if (ObjectID.isValid(devEvent.getId())) {
            db.collection(DevEventManager.ENTITY).findOne({
                _id: new ObjectID(devEvent.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Dev Event not found"));
                } else {
                    let devEvent = new DevEvent(res);
                    callback(null, devEvent);
                }
            });
        } else {
            callback(new Error("Invalid devEvent's id passed"));
        }
    }

    static get(devEvent, callback) {
        db.collection(DevEventManager.ENTITY).findOne({name: devEvent.getType()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Dev Event not found"));
            } else {
                let devEvent = new DevEvent(res);
                callback(null, devEvent);
            }
        });
    }

    static create(devEvent, callback) {
        db.collection(DevEventManager.ENTITY).insertOne({
            dev_id: devEvent.getDevId(),
            etime: devEvent.getEtime(),
            type: devEvent.getType(),
            data: devEvent.getData()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(devEvent, callback) {
        if (ObjectID.isValid(devEvent.getId())) {
            db.collection(DevEventManager.ENTITY).findOneAndUpdate({
                _id: new ObjectID(devEvent.getId())
            }, {
                $set: {
                    etime: devEvent.getEtime(),
                    dev_id: devEvent.getDevId(),
                    type: devEvent.getType(),
                    data: devEvent.getData()
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
            callback(new Error("Invalid devEvent's id passed"));
        }
    }

    static remove(devEvent, callback) {
        if (ObjectID.isValid(devEvent.getId())) {
            db.collection(DevEventManager.ENTITY).deleteOne({
                _id: new ObjectID(devEvent.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid devEvent's id passed"));
        }
    }

    static removeByQuery(query, callback) {
        db.collection(DevEventManager.ENTITY).deleteMany(query, function (err, res) {
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

module.exports = DevEventManager;
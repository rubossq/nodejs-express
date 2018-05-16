let db = require("estorm-db").get();
let AppEntity = require("./AppEntity");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "appentity";

class AppEntityManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({package_id: 1}, {unique: true});
        db.collection(ENTITY).createIndex({type: 1});
        db.collection(ENTITY).createIndex({ptime: 1});
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let app = new AppEntity(l);
                    cb(null, app);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static oneByOrder(query, orderby, callback) {
        db.collection(ENTITY).find(query).sort(orderby).limit(1).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let app = new AppEntity(l);
                    cb(null, app);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static create(appEntity, callback) {
        db.collection(ENTITY).insertOne({
            package_id: appEntity.getPackageId(),
            type: appEntity.getType(),
            ptime: appEntity.getPtime()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(appEntity, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            package_id: appEntity.getPackageId()
        }, {
            $set: {
                package_id: appEntity.getPackageId(),
                type: appEntity.getType()
            },
            $setOnInsert:{ptime: appEntity.getPtime()}
        }, {
            upsert: true
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    static remove(appEntity, callback) {
        if (ObjectID.isValid(appEntity.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(appEntity.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid appEntity's id passed"));
        }
    }
}

module.exports = AppEntityManager;
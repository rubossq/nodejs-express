let db = require("estorm-db").get();
let DevEntity = require("./DevEntity");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "deventity";

class DevEntityManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({store_dev_id: 1}, {unique: true});
        db.collection(ENTITY).createIndex({ptime: 1});
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let dev = new DevEntity(l);
                    cb(null, dev);
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
                    let dev = new DevEntity(l);
                    cb(null, dev);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static create(devEntity, callback) {
        db.collection(ENTITY).insertOne({
            store_dev_id: devEntity.getStoreDevId(),
            ptime: devEntity.getPtime()
        }, function (err, res) {
            callback(null);
        });
    }

    static update(devEntity, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            store_dev_id: devEntity.getStoreDevId()
        }, {
            $set: {
                store_dev_id: devEntity.getStoreDevId()
            },
            $setOnInsert: {ptime: devEntity.getPtime()}
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

    static remove(devEntity, callback) {
        if (ObjectID.isValid(devEntity.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(devEntity.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid devEntity's id passed"));
        }
    }
}

module.exports = DevEntityManager;
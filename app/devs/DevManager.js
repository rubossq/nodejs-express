let db = require("estorm-db").get();
let Dev = require("./Dev");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "dev";

class DevManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({store_dev_id: 1}, {unique: true});
        db.collection(ENTITY).createIndex({ptime: 1});
    }

    static list(query, skip, limit, callback) {
        console.log(skip + " " + limit);
        db.collection(ENTITY).find(query).sort({_id: -1}).skip(skip).limit(limit).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let dev = new Dev(l);
                    cb(null, dev);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static info(dev, callback) {
        if (ObjectID.isValid(dev.getId())) {
            db.collection(ENTITY).findOne({
                _id: new ObjectID(dev.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Dev not found"));
                } else {
                    let dev = new Dev(res);
                    callback(null, dev);
                }
            });
        } else {
            callback(new Error("Invalid dev's id passed"));
        }
    }

    static get(dev, callback) {
        db.collection(ENTITY).findOne({store_dev_id: dev.getStoreDevId()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Dev not found"));
            } else {
                let dev = new Dev(res);
                callback(null, dev);
            }
        });
    }

    static create(dev, callback) {
        db.collection(ENTITY).insertOne({
            name: dev.getName(),
            store_dev_id: dev.getStoreDevId(),
            address: dev.getAddress(),
            website: dev.getWebsite(),
            email: dev.getEmail(),
            ptime: dev.getPtime()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static oneByOrder(query, orderby, callback) {
        db.collection(ENTITY).find(query).sort(orderby).limit(1).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let dev = new Dev(l);
                    cb(null, dev);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static updatePtime(dev, callback) {
        if (ObjectID.isValid(dev.getId())) {
            db.collection(ENTITY).findOneAndUpdate({
                _id: new ObjectID(dev.getId())
            }, {
                $set: {
                    ptime: dev.getPtime()
                }
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {

                    callback(null);
                }
            });
        } else {
            callback(new Error("Invalid dev's id passed"));
        }
    }

    static update(dev, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            store_dev_id: dev.getStoreDevId()
        }, {
            $set: {
                name: dev.getName(),
                store_dev_id: dev.getStoreDevId(),
                address: dev.getAddress(),
                website: dev.getWebsite(),
                email: dev.getEmail(),
                ptime: dev.getPtime()
            }
        }, {upsert: true}, function (err, res) {
            if (err) {
                callback(err);
            } else {
                let id = res.lastErrorObject.upserted || res.value._id;
                callback(null, id);
            }
        });
    }

    static remove(dev, callback) {
        if (ObjectID.isValid(dev.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(dev.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid dev's id passed"));
        }
    }
}

module.exports = DevManager;
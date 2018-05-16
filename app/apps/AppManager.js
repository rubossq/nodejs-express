let db = require("estorm-db").get();
let App = require("./App");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "app";

class AppManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({package_id: 1}, {unique: true});
        db.collection(ENTITY).createIndex({name: 1});
        db.collection(ENTITY).createIndex({system_developer_id: 1});
        db.collection(ENTITY).createIndex({developer_id: 1});
        db.collection(ENTITY).createIndex({ptime: 1});
    }

    static listControl(query, skip, limit, callback) {
        db.collection(ENTITY).find(query).sort({_id: -1}).skip(skip).limit(limit).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let app = new App(l);
                    cb(null, app);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).sort({_id: -1}).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let app = new App(l);
                    cb(null, app);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static info(app, callback) {
        if (ObjectID.isValid(app.getId())) {
            db.collection(ENTITY).findOne({
                _id: new ObjectID(app.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("App not found"));
                } else {
                    let app = new App(res);
                    callback(null, app);
                }
            });
        } else {
            callback(new Error("Invalid app's id passed"));
        }
    }

    static get(app, callback) {
        db.collection(ENTITY).findOne({package_id: app.getPackageId()}, function (err, res) {
            if (err || !res) {
                callback(new Error("App not found"));
            } else {
                let app = new App(res);
                callback(null, app);
            }
        });
    }

    static create(app, callback) {
        db.collection(ENTITY).insertOne({
            system_developer_id: app.getSystemDeveloperId(),
            name: app.getName(),
            package_id: app.getPackageId(),
            developer_id: app.getDeveloperId(),
            images: app.getImages(),
            size: app.getSize(),
            desc: app.getDesc(),
            updates: app.getUpdates(),
            version: app.getVersion(),
            category: app.getCategory(),
            icon: app.getIcon(),
            downloads: app.getDownloads(),
            price: app.getPrice(),
            rating: app.getRating(),
            comments: app.getComments(),
            os_version: app.getOsVersion(),
            ptime: app.getPtime()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(app, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            package_id: app.getPackageId()
        }, {
            $set: {
                system_developer_id: app.getSystemDeveloperId(),
                name: app.getName(),
                package_id: app.getPackageId(),
                developer_id: app.getDeveloperId(),
                images: app.getImages(),
                size: app.getSize(),
                desc: app.getDesc(),
                updates: app.getUpdates(),
                version: app.getVersion(),
                category: app.getCategory(),
                icon: app.getIcon(),
                downloads: app.getDownloads(),
                price: app.getPrice(),
                rating: app.getRating(),
                comments: app.getComments(),
                os_version: app.getOsVersion(),
                ptime: app.getPtime()
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

    static oneByOrder(query, orderby, callback) {
        db.collection(ENTITY).find(query).sort(orderby).limit(1).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let app = new App(l);
                    cb(null, app);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static updatePtime(app, callback) {
        if (ObjectID.isValid(app.getId())) {
            db.collection(ENTITY).findOneAndUpdate({
                _id: new ObjectID(app.getId())
            }, {
                $set: {
                    ptime: app.getPtime()
                }
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {

                    callback(null);
                }
            });
        } else {
            callback(new Error("Invalid app's id passed"));
        }
    }

    static remove(app, callback) {
        if (ObjectID.isValid(app.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(app.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid app's id passed"));
        }
    }
}

module.exports = AppManager;
let express = require('express');
let router = express.Router();
let appEntitiesController = require("../controllers/appEnities");

const {PermissionsManager} = require("estorm-permissions");

const {check, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const crumbs = require("estorm-crumbs");

const {AppEntityManager, AppEntityType} = require('../app/phantom');

const tempstor = require('estorm-tempstor');

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, AppEntityManager.ENTITY, req.params);

    appEntitiesController.list(req, res, function (err, list) {
        if (err) {
            next(err);
        } else {
            console.log(list);
            res.render('pages/appentities/index', {title: 'App Entitiies list', appentities: list});
        }
    });
});

// GET create app entity
router.get('/create', PermissionsManager.check([PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {

    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }
    crumbs.pushForward("Create app entity", res.locals.routePath + "/create", res);
    let cancelLink = res.locals.routePath;

    let types = AppEntityType.getTypes();

    res.render('pages/appentities/edit', {
        title: 'Create new app entity',
        isNotValidate: isNotValidate,
        message: message,
        cancelLink: cancelLink,
        types: types
    });
});

/**
 * create new app entity
 */
router.post('/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), [
    check('appentity.package_id').exists(),

    sanitizeBody('appentity.package_id').trim().escape()
], function (req, res, next) {

    tempstor.set(req, AppEntityManager.ENTITY, req.body.appentity);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.notValid = true;
        req.session.errMessage = "Enter data";
        res.redirect('create/');
    } else {
        appEntitiesController.create(req, res, function (err, count) {
            if (err) {
                if (err.code === 11000) {
                    req.session.notValid = true;
                    req.session.errMessage = "App entity is exist";

                    res.redirect('create/');
                } else {
                    next(err);
                }
            } else {
                res.redirect("/apps");
            }
        });
    }
});

// POST delete app entity
router.post('/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, AppEntityManager.ENTITY, req.params);

    appEntitiesController.delete(req, res, function (err, count) {
        if (err) {
            next(err);
        } else {
            res.redirect("/appentities");
        }
    });
});

module.exports = router;

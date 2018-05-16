let express = require('express');
let router = express.Router();
let devEntitiesController = require("../controllers/devEnities");

const {PermissionsManager} = require("estorm-permissions");

const {check, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const crumbs = require("estorm-crumbs");

const {DevEntityManager} = require('../app/phantom');

const tempstor = require('estorm-tempstor');

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, DevEntityManager.ENTITY, req.params);

    devEntitiesController.list(req, res, function (err, list) {
        if (err) {
            next(err);
        } else {
            res.render('pages/deventities/index', {title: 'Dev Entitiies list', appentities: list});
        }
    });
});

// GET create dev entity
router.get('/create', PermissionsManager.check([PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {

    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }

    crumbs.pushForward("Create dev entity", res.locals.routePath + "/create", res);
    let cancelLink = res.locals.routePath;

    res.render('pages/deventities/edit', {
        title: 'Create new dev entity',
        isNotValidate: isNotValidate,
        message: message,
        cancelLink: cancelLink
    });
});

/**
 * create new dev entity
 */
router.post('/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), [
    check('deventity.store_dev_id').exists(),

    sanitizeBody('deventity.store_dev_id').trim().escape()
], function (req, res, next) {

    tempstor.set(req, DevEntityManager.ENTITY, req.body.deventity);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.notValid = true;
        req.session.errMessage = "Enter data";
        res.redirect('create/');
    } else {
        devEntitiesController.create(req, res, function (err, count) {
            if (err) {
                if (err.code === 11000) {
                    req.session.notValid = true;
                    req.session.errMessage = "Dev entity is exist";

                    res.redirect('create/');
                } else {
                    next(err);
                }
            } else {
                res.redirect("/devs");
            }
        });
    }
});

// POST delete app entity
router.post('/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, DevEntityManager.ENTITY, req.params);

    devEntitiesController.delete(req, function (err, count) {
        if (err) {
            next(err);
        } else {
            res.redirect("/deventities");
        }
    });
});

module.exports = router;

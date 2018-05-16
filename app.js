let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const {PermissionsManager} = require("estorm-permissions");

const crumbs = require("estorm-crumbs");

let {LoginRouter, LogoutRouter} = require('estorm-auth');
let apps = require('./routes/apps');
let hype = require('./routes/hype');
let devs = require('./routes/devs');
let appentities = require('./routes/appentities');
let deventitites = require('./routes/deventities');
let index = require('./routes/index');
let api = require('./routes/api');

const environment = process.env.NODE_ENV || 'development';
let config = require('./app/config')[environment];

const {TokenManager, AuthManager} = require('estorm-auth');
TokenManager.init(config.JWT_SECRET);
AuthManager.init(config.RENEW_TOKEN_URL, config.ESTORM_TOKEN_CHECK_URL, config.ESTORM_LOGIN_URL);

let {AppEntityManager, DevEntityManager} = require("./app/phantom");
let {AppManager} = require("./app/apps");
let {DevManager} = require("./app/devs");
let {AppEventManager} = require("./app/appevent");
let {DevEventManager} = require("./app/devevent");

let url = require('url');

let app = express();

AuthManager.JWTInit(app);
AppEntityManager.init();
DevEntityManager.init();
AppManager.init();
DevManager.init();
AppEventManager.init();
DevEventManager.init();

app.use(session({
    store: new MongoStore({url: config.DB_SCHEME + config.DB_LOGIN + ':' + config.DB_PASSWORD + config.DB_URL + config.DB_SESSIONS_NAME}),
    secret: config.MONGO_SECRET,
    resave: false,
    saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view options', {layout: 'layouts/layout'});
app.set('view engine', 'hbs');

const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

// set global base URL
app.use(function (req, res, next) {
    res.locals.base_url = url.format({
        protocol: req.protocol,
        host: req.get('host')
    });
    res.locals.routePath = req.path;
    next();
});

// open access for public and resources folders
app.use(express.static(path.join(__dirname, 'public')));
app.use("/resources", express.static(path.join(__dirname, 'resources')));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));

// define limit for request body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

app.use('/api', function (req, res, next) {
    req.apireq = true;
    next();
}, api);

app.use(AuthManager.JWTMiddleware);

/**
 * set permissions to request user
 * set user to response
 */
app.use(function (req, res, next) {
    if (req.user) {
        req.user.permissionsObject = PermissionsManager.createPermissionsObject(req.user.permissions);
        res.locals.baseUser = req.user;
    }
    next();
});

// main routing
app.use('/login', LoginRouter);
app.use('/logout', LogoutRouter);
app.use('/apps', function (req, res, next) {
    res.locals.addLink = "/appentities/create";
    res.locals.addText = "+ Add an app entity";

    res.locals.infoLink = "/hype";
    res.locals.infoText = "Hype";

    res.locals.moreLink = "/devs";
    res.locals.moreText = "Devs";

    next();
}, crumbs.push("Apps", "/apps"), apps);
app.use('/devs', function (req, res, next) {
    res.locals.addLink = "/deventities/create";
    res.locals.addText = "+ Add an dev entity";

    res.locals.infoLink = "/hype";
    res.locals.infoText = "Hype";

    res.locals.moreLink = "/apps";
    res.locals.moreText = "Apps";

    next();
}, crumbs.push("Devs", "/devs"), devs);
app.use('/appentities', function (req, res, next) {

    res.locals.addLink = "/apps";
    res.locals.addText = "Apps";

    res.locals.moreLink = "/devs";
    res.locals.moreText = "Devs";

    res.locals.routePath = "/appentities";

    next();
}, appentities);
app.use('/hype', function (req, res, next) {
    res.locals.addLink = "/apps";
    res.locals.addText = "Apps";

    res.locals.infoLink = "/hype/growth";
    res.locals.infoText = "Growth";

    res.locals.infoLink2 = "/hype";
    res.locals.infoText2 = "Hype";

    res.locals.moreLink = "/devs";
    res.locals.moreText = "Devs";

    next();
}, crumbs.push("Hype", "/hype"), hype);
app.use('/deventities', function (req, res, next) {

    res.locals.addLink = "/apps";
    res.locals.addText = "Apps";

    res.locals.moreLink = "/devs";
    res.locals.moreText = "Devs";

    res.locals.routePath = "/deventities";

    next();
}, deventitites);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    console.log(err);
    if (req.apireq || req.method !== "GET") {
        let json = {status: "err", message: err.status, err_status: err.message};
        res.json(json);
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('pages/error');
    }
});

module.exports = app;

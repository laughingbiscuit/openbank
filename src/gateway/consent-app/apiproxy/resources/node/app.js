var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var ApigeeStore = require('express-session-apigee-cache')(session);
var cookieParser = require('cookie-parser');
var style = require('./controllers/style');

// Routes
var routes = require('./routes/index');
var login = require('./routes/login');
var consent = require('./routes/consent');
var otp = require('./routes/otp');

// Configuration
var config = require('./config.json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set the config values.
app.set('config', config);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  cache: 'consent_app_session',
  prefix: "casess:",
  ttl: 300,
}
app.use(session({
   store: new ApigeeStore(options),
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: false
}));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers","*");
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

// Define the routes
app.use('/', routes);
app.use('/login', login);
app.use('/consent', consent);
app.use('/otp', otp);


// Add the custom styles.
style.setBasicStyles();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;

//start

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

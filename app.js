var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var gameServer  = require("./game_server/js/game-server.js");

var routes = {
        index: require('./routes/index'),
        games: require('./routes/games')
    };

console.log("Starting the web server.");

var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout', 'layout')
app.engine('html', require('hogan-express'))

//Global variables
app.locals.isProd = (process.env.NODE_ENV == 'prod');

app.use(favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use('/', routes.index);
app.use('/game', routes.games);

app.get('/test', function(req, res){
  res.send(Object.keys(gameServer.games));
});

// Handle 404
app.use(function(req, res) {
 res.render('404');
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.startGameServer = function(app) {
    gameServer.configureAndStart(app);
};

module.exports = app;


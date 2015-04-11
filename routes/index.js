var express = require('express');
var router  = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

/* GET register page. */
router.get('/play', function(req, res) {
    res.render('games/register');
});

/* GET current game page. */
router.get('/current-game', function(req, res) {
    res.render('ongoing.html');
});

/* GET genaral informations page. */
router.get('/general-informations', function(req, res) {
    res.render('info.html');
});

module.exports = router;

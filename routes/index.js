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

/* GET genaral informations page. */
router.get('/about', function(req, res) {
    res.render('about.html');
});

module.exports = router;

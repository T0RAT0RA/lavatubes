var express     = require('express');
var app         = require('../app');
var router 	    = express.Router();
var gameServer  = require("../game_server/js/game-server.js");

/* GET game page. */
router.get('/:id', function(req, res) {
    //Check if the game exist
    if (!gameServer.games[req.params.id]) {
        res.send(404, "The game " + req.params.id + " doesn't exist.");
    }

    res.render('games/game', {
        game_id: req.params.id
    });
});

module.exports = router;

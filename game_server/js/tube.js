var cls     = require("./lib/class"),
    _       = require("underscore"),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = Tube = Entity.extend({
    init: function(config) {
        var self = this;

        this.id     = config.id || Date.now();
        this.oxygen = config.oxygen || _.random(5, 70);

        this.game   = config.game;
        this.player = null;

        console.log("Create tube #" + this.id);
    },

    assignPlayer: function(player) {
        this.player = player;
    },

    getCleanEntity: function(player) {
        var json = _.omit(this, 'game', 'player');
        if (this.player) {
            json.player = this.player.id
        }
        
        return json;
    }
});

var cls     = require("./lib/class"),
    _       = require("underscore"),
    moment  = require('moment'),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = RandomEvent = Entity.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this.id     = Date.now();
        this.type   = config.type || null;
        this.startAt= config.startAt || null;
        this.endAt  = config.endAt || null;
    },

    update: function(){
    },

    ends: function(callback){
        console.log('Event ends', this.id);
        if(callback) {
            callback();
        }
    },

    getCleanEntity: function() {
        var json = _.omit(this, 'game', 'player');
        json.startAt    = this.startAt.format('HH:mm:ss');
        json.endAt      = this.endAt.format('HH:mm:ss');
        return json;
    }
});

var cls     = require("./lib/class"),
    _       = require("underscore"),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = Player = Entity.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this.id     = config.id || Date.now();
        this.name   = this.getRandomName();

        this.game   = config.game;
        this.hasEnteredGame = false;
        this.isReady = false;

        this.socket.on("disconnect", function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        this.socket.on("*", function(event) {
            var action  = event.name,
                data    = event.args[0];

            if (Types.Messages.DISCONNECT == action) {
                if(self.exit_callback) {
                    self.exit_callback();
                }
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    hasAction: function(id) {
        return _.findWhere(this.actionsAvailable, {id: id});
    },

    formatUsername: function(username) {
        return username.replace(/ /gi, "_").toLowerCase();
    },

    getRandomName: function() {
        return "John Doe";
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});

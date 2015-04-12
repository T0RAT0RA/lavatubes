var cls     = require("./lib/class"),
    _       = require("underscore"),
    Log     = require('log'),
    fs      = require('fs'),
    Player  = require('./player'),
    Tube    = require('./tube'),
    Maps    = require("../../shared/js/maps"),
    moment  = require('moment'),
    RandomEvent = require('./randomEvent'),
    Types   = require("../../shared/js/gametypes");

// ======= GAME SERVER ========
module.exports = Game = cls.Class.extend({
    init: function(id, maxTubes, server) {
        var self = this;


        this.name       = this.getRandomName();
        this.id         = this.name.toLowerCase().replace(' ', '-') + '-' + id;
        this.maxTubes   = maxTubes;
        this.server     = server;
        this.ups        = 1;
        this.secondsPerDay = 3;
        this.maps       = Maps;
        this.startTime  = Date.now();
        this.entities   = {};
        this.tubes      = {};
        this.players    = {};
        this.randomEvents = {};

        console.log("Create new game #" + this.id);

        this.initTubes();

        this.playerCount = 0;

        this.onPlayerEnter(function(player) {
            log.debug("Player #" + player.id + " entered game " + self.id);

            player.onExit(function() {
                log.debug("Player #" + player.id + " has left game " + self.id);

                self.removePlayer(player);
                self.broadcast(Types.Messages.MESSAGE, player.name + " has left the game.");

                if(self.removed_callback) {
                    self.removed_callback();
                }
            });

            var tube = this.getRandomEmptyTube();
            //No more tube...
            if (!tube){
                 player.send(Types.Messages.ENTERGAME, {success: false, error: 'No more tube available'});
                 return;
            }
            tube.assignPlayer(player);
            player.assignTube(tube);

            self.addPlayer(player);

            //Init player object on client side
            player.send(Types.Messages.ENTERGAME, {success: true, player: player.getCleanEntity(), game: self.getState()});

            //Send each existing entity to the player game
            _.each(self.entities, function(entity){
                player.send(Types.Messages.SPAWN, self.getCleanEntity(entity));
            });

            player.hasEnteredGame = true;
            self.broadcast(Types.Messages.MESSAGE, "Player " + player.name + " has joined the game.");  
            self.broadcast(Types.Messages.MAP, this.maps);

            if(self.added_callback) {
                self.added_callback();
            }
        });


        log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
    },

    initTubes: function() {
        for (var i = 0; i < this.maxTubes; i++){
            var tube = new Tube({game: this, id: _.size(this.tubes) + 1});
            this.addTube(tube);
        }
    },
    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerDisconnect: function(callback) {
        this.disconnect_callback = callback;
    },

    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    onPlayerAdded: function(callback) {
        this.added_callback = callback;
    },

    onPlayerRemoved: function(callback) {
        this.removed_callback = callback;
    },

    run: function() {
        var self = this;

        //State loop
        setInterval(function() {
            self.broadcast(Types.Messages.GAMESTATE, self.getState());
        }, 1000 / this.ups);

        //Update days
        setInterval(function() {
            self.updateRandomEvents();
            self.updatePlayers();
            self.broadcast(Types.Messages.GAMESTATE, self.getState());
        }, 1000 * this.secondsPerDay);

        log.info(""+this.id+" running...");
    },

    updatePlayers: function() {
        _.each(this.players, function(player) {
            player.update();
        });
    },

    updateRandomEvents: function() {
        var self = this;

        _.each(this.randomEvents, function(randomEvent) {
            if (randomEvent.startAt.isAfter(moment())) {
                return;
            }
            randomEvent.update();
            if (randomEvent.endAt.isBefore(moment())) {
                randomEvent.ends(function(){
                    self.removeRandomEvent(randomEvent);
                });
            }
        });

        //Create random events
        if (!_.size(this.randomEvents)) {
            console.log('Create random event')
            var startAt = moment().add(_.random(10, 60), 's');
            var endAt   = moment(startAt).add(_.random(20, 60), 's');
            var randomEvent = new RandomEvent({
                type    : 'dustStorm',
                startAt : startAt,
                endAt   : endAt
            })
            this.addRandomEvent(randomEvent);
        }
    },

    addEntity: function(entity) {
        this.entities[entity.id] = entity;
        this.broadcast(Types.Messages.SPAWN, this.getCleanEntity(entity));
    },

    removeEntity: function(entity) {
        if(entity.id in this.entities) {
            delete this.entities[entity.id];
        }
        entity.destroy();

        this.broadcast(Types.Messages.DESPAWN, {id: entity.id});
    },

    addPlayer: function(player) {
        this.addEntity(player);
        this.players[player.id] = player;
    },

    removePlayer: function(player) {
        this.removeEntity(player);
        delete this.players[player.id];

        //We remove the game if no player in 1 minute
        setTimeout(this.tryToRemoveGame.bind(this), 60 * 1000);
    },

    addRandomEvent: function(randomEvent) {
        this.addEntity(randomEvent);
        this.randomEvents[randomEvent.id] = randomEvent;
    },

    removeRandomEvent: function(randomEvent) {
        this.removeEntity(randomEvent);
        delete this.randomEvents[randomEvent.id];
    },

    addTube: function(tube) {
        this.addEntity(tube);
        this.tubes[tube.id] = tube;
    },

    getRandomEmptyTube: function() {
        //Get all tubes and reject the ones with players
        var emptyTubes = _.reject(this.tubes, function(tube){ return tube.player? true : false; }),
            randomTube = _.sample(emptyTubes);
        return randomTube;
    },

    getEntitiesByType: function() {
        return _.groupBy(this.entities, function(entity) {
          return entity.type;
        });
    },

    tryToRemoveGame: function() {
        //Delete the game if no more players
        if (Object.keys(this.players).length <= 0) {
            return this.server.removeGame(this);
        }

        return false;
    },

    broadcast: function(type, message) {
        //this.server.sockets.emit(type, message);
        //Do we need to broadcast to players?
        _.each(this.players, function(player){
            player.socket.emit(type, message);
        });
        
    },

    getCleanEntity: function(entity) {
        return _.omit(entity, 'game', 'socket', 'player', 'tube', 'actionsAvailable');
    },

    getState: function() {
        var self = this,
            filtered_players     = _.map(this.players, function(player){ return player.getCleanEntity(); });
            filtered_tubes       = _.map(this.tubes, function(tube){ return tube.getCleanEntity(); });
            filtered_randomEvent = _.map(this.randomEvents, function(randomEvent){ return randomEvent.getCleanEntity(); });

        return {
            id: self.id,
            state: self.state,
            time: new Date().toLocaleTimeString(),
            players_count: Object.keys(filtered_players).length,
            max_tubes: self.maxTubes,
            randomEvents: filtered_randomEvent,
            tubes: filtered_tubes
        }
    },

    getRandomName: function() {
        return _.shuffle([
            "Spirit",
            "Deep space",
            "Mariner",
            "Opportunity",
            "MAVEN",
            "Sojourner",
            "Odyssey"
        ])[0];
    }
});

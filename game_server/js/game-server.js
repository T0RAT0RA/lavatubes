var cls     = require("./lib/class"),
    http    = require("http"),
    url     = require("url"),
    fs      = require("fs"),
    Game    = require("./game"),
    Types   = require("../../shared/js/gametypes"),
    Log     = require('log'),
    _       = require('underscore'),
    socketio = require('socket.io'),
    socketioWildcard = require('socket.io-wildcard');

GameServer = cls.Class.extend({
    init: function() {
    },

    configureAndStart: function(app, configPath) {
        var self = this;

        self.app = app;
        self.defaultConfigPath = './game_server/config.games.json';
        self.configPath = configPath || self.defaultConfigPath;
        self.games = [];
        self.playerCount = 0;

        //Read the config file
        self.getConfigFile(self.configPath, function(config) {
            if(config) {
                self.startGameServer(config);
            } else {
                console.error("Game Server cannot start without configuration file.");
                process.exit(1);
            }
        });
    },

    startGameServer: function(config) {
        var self = this;

        console.log("Starting the game server.");
        this.app.gameServer = this;

        this.io = socketioWildcard(socketio).listen(self.app, {log: false});

        switch(config.debug_level) {
            case "error":
                log = new Log(Log.ERROR); break;
            case "debug":
                log = new Log(Log.DEBUG); break;
            case "info":
                log = new Log(Log.INFO); break;
        };

        self.io.sockets.on("connection", function(socket) {
            self.socket = socket;

            //Send GAMES info to the user
            socket.emit(Types.Messages.GAMESINFO, {games: self.getGamesInfo()});

            //Create a new run server
            socket.on(Types.Messages.NEWGAME, function() {
                var maxTubes = 4;
                game = new Game(_.uniqueId(), maxTubes, self);
                game.run();
                self.games[game.id] = game;
                socket.emit(Types.Messages.NEWGAME, {success: true, game: game.id});
                self.sendGamesInfo();
            });

            //Connect player to a game
            socket.on(Types.Messages.ENTERGAME, function(data) {
                var success = true,
                    error = "",
                    game = {};

                if (self.games[data.game]) {
                    game = self.games[data.game];
                } else {
                    success = false;
                    error = "Game " + data.game + " doesn't exist.";
                    console.log(error);
                }

                //Check if server is full
                if (_.keys(game.players).length >= game.maxPlayers) {
                    success = false;
                    error = "Game " + data.game + " is full.";
                    console.log(error);
                }

                if (success) {
                    player = new Player({
                        id: ++self.playerCount,
                        socket: socket,
                        game: game,
                        name: data.name
                    });
                    game.enter_callback(player);
                } else {
                    socket.emit(Types.Messages.ENTERGAME, {success: success, error: error});
                }

                self.sendGamesInfo();
            });

            //Connect controller to a player
            socket.on(Types.Messages.NEWCONTROLLER, function(data) {
            });
        });
    },

    getGamesInfo: function() {
        gamesInfo = {};
        for (id in this.games) {
            game = this.games[id];
            gamesInfo[id] = {
                id: id,
                players: _.keys(game.players).length,
                maxPlayers: game.maxTubes
            };
        }
        return gamesInfo;
    },

    removeGame: function(game) {
        if (this.games[game.id]) {
            log.debug("Removing game " + game.id);
            delete this.games[game.id];

            this.sendGamesInfo();

            return true;
        }

        return false;
    },

    sendGamesInfo: function() {
        this.socket.broadcast.emit(Types.Messages.GAMESINFO, {games: this.getGamesInfo()});
    },

    getConfigFile: function(path, callback) {
        fs.readFile(path, 'utf8', function(err, json_string) {
            if(err) {
                console.error("Could not open config file:", err.path);
                callback(null);
            } else {
                callback(JSON.parse(json_string));
            }
        });
    }
});
gameServer = module.exports = new GameServer();
define(["io"], function (io) {
    var socket = io.connect(),
        game = {};

    var App = Class.extend({
        init: function() {
            this.log_div = ".game-state .messages";

            console.log("App - init");

            socket.on(Types.Messages.GAMESINFO, this.updateGamesInfo.bind(this));
            socket.on(Types.Messages.GAMEINFO, this.updateGameInfo.bind(this));
            socket.on(Types.Messages.NEWGAME, this.newGame.bind(this));
            socket.on(Types.Messages.ENTERGAME, this.enterGame.bind(this));
            socket.on(Types.Messages.RADIO, this.onRadioMessage.bind(this));
            socket.on("disconnect", this.onGameDisconnect.bind(this));

            this.bindEvents();

            $(".register button, .register select").prop("disabled", false);
            $(".register .loader, .game .loader").remove();

            if (name = localStorage.getItem('playername')) {
                $('.player-name').val(name);
            }
        },

        bindEvents: function () {
            var self = this;

            $(".register .new-game").on("click", function() {
                //Save name in localstorage
                var name = $('.player-name').val();
                localStorage.setItem('playername', name);
                socket.emit(Types.Messages.NEWGAME);
            });

            $(".register .game-list").on("change", function() {
                if (!$(this).val()) { return; }
                window.location = "/game/" + $(this).val();
            });

            var matches = window.location.pathname.match(/game\/([^\/]*)\/?$/);
            if (matches && matches[1]) {
                var gameId = matches[1];
                localStorage.getItem('playername');
                socket.emit(Types.Messages.ENTERGAME, {game: gameId, name: name});
            }

            //Handle radio communication
             $('body').on('keydown', '.radio input', function(e) {
                if(e.keyCode == 13) {
                    var input = $(this);
                    if (input.val()) {
                        socket.emit(Types.Messages.RADIO, input.val());
                    }
                    input.val('');
                }
            });
        },

        newGame: function (data) {
            if (data.game) {
                window.location = "/game/" + data.game;
            }
        },

        enterGame: function (data) {
            if (!data.success) {
                console.log(data.error);
                window.location.hash = "";
                return;
            }

            console.log("App - enterGame");

            $(".register").remove();
            $(".game .game-id").html(data.game.id);
            $(".player-count").html(data.game.players_count);

            $(".game, .game .desktop").show();
        },

        updateGamesInfo: function (data) {
            $(".register .game-list option:gt(0)").remove();
            for (id in data.games) {
                game = data.games[id];
                $(".register .game-list").append($("<option>",{
                    value: id,
                    text: id + " (" + game.players + "/" + game.maxPlayers + ")"
                }));
            }
        },

        onRadioMessage: function (data) {
            this.logMessages(data.name + ": " + data.message);
        },

        updateGameInfo: function (data) {
            $(".player-count").html(data.players_count);
            $(".game-info").html(JSON.stringify(data, null, 2));
        },

        onGameDisconnect: function(callback) {
            setTimeout(function() {
                window.location.reload();
            }, 1000);

        },

        logMessages: function(message) {
            $("<div>").html(message).hide().appendTo('.radio .messages').fadeIn();
        }
    });

    var app = new App();
});

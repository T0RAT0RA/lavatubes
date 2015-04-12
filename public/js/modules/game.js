define(["io", "modules/gameRenderer"], function (io, GameRenderer) {
    var socket = io.connect(),
        game = {};

    var App = Class.extend({
        init: function() {
            var self = this;
            this.log_div  = ".game-state .messages";
            this.socket   = socket;
            this.render   = new GameRenderer(this);
            console.log("App - init");
            socket.on(Types.Messages.GAMESINFO, this.updateGamesInfo.bind(this));
            socket.on(Types.Messages.GAMESTATE, this.updateGameState.bind(this));
            socket.on(Types.Messages.NEWGAME, this.newGame.bind(this));
            socket.on(Types.Messages.ENTERGAME, this.enterGame.bind(this));
            socket.on(Types.Messages.INIT, this.initPlayer.bind(this));
            socket.on(Types.Messages.RADIO, this.onRadioMessage.bind(this));
            socket.on(Types.Messages.MAP, this.render.initMap.bind(this.render));
            socket.on("disconnect", this.onGameDisconnect.bind(this));
            
            this.startLoader();
            this.bindEvents();

            $(".register button, .register select, .player-name").prop("disabled", false);
            if (name = localStorage.getItem('playername')) {
                $('.player-name').val(name);
            }
            setTimeout(function() {
                self.displayMenu();
            }, 1000);
        },

        bindEvents: function () {
            var self = this;

            $(".register .new-game").on("click", function() {
                var name = $('.player-name');
                name.removeClass('error');

                if (!name.val()) {
                    name.addClass('error');
                    return false;
                }

                //Save name in localstorage
                localStorage.setItem('playername', name.val());
                socket.emit(Types.Messages.NEWGAME);
            });

            $(".register .game-list").on("click", ".join", function() {
                var name = $('.player-name');
                name.removeClass('error');
                if (!name.val()) {
                    name.addClass('error');
                    return false;
                }
                var gameId = $(this).closest('[data-id]').attr('data-id');
                if (!gameId) { return; }
                window.location = "/game/" + gameId;
            });

            var matches = window.location.pathname.match(/game\/([^\/]*)\/?$/);
            if (matches && matches[1]){
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
                        $('.messages').animate({ scrollTop: $('.messages').height() }, "slow");
                    }
                    input.val('');
                }
            });


            $(".game .mars-map").on('click', '.my-tube', function(){
                $(".game .tube-map").show();
                $(".game .mars-map").hide();
            });
            $(".game .tube-map").on('click', '.to-mars', function(){
                $(".game .tube-map").hide();
                $(".game .mars-map").show();
            });
        },

        newGame: function (data) {
            if (data.game) {
                window.location = "/game/" + data.game;
            }
        },

        enterGame: function (data) {
            var self = this;
            if (!data.success) {
                console.log(data.error);
                window.location.hash = "";
                return;
            }

            console.log("App - enterGame");
            console.log(data);

            this.playerId   = data.player.id;
            this.tubeId     = data.player.tube;
            this.oxygenDiv  = $('.res-oxygen span');
            $('.playername span').html(data.player.name);

            $(".register").remove();
            $(".game .game-id").html(data.game.id);
            $(".player-count").html(data.game.players_count);

            setTimeout(function() {
                self.displayMap();
            }, 3000);
        },

        updateGamesInfo: function (data) {
            $(".register .game-list tr:gt(0)").remove();
            for (id in data.games) {
                var game = data.games[id];
                var tr = $('<tr>', {'data-id': id});
                tr.append($('<td>').html(id));
                tr.append($('<td>').html(game.players + "/" + game.maxPlayers));
                tr.append($('<td>').html('<button class="join">Join</button>'));
                $(".register .game-list").append(tr);
            }
        },

        initPlayer: function (player) {
            this.player = player;
        },

        onRadioMessage: function (data) {
            this.logMessages(data.name + ": " + data.message);
        },

        updateGameState: function (data) {
            $(".player-count").html(data.players_count);
            this.printGameState(data);

            for (i in data.tubes){
                if (data.tubes[i].id == this.tubeId) {
                    var currentTube = data.tubes[i];
                    this.oxygenDiv.html(currentTube.player.oxygen);
                    this.oxygenDiv.removeClass('danger warning');
                    if (currentTube.player.oxygen <= 10) {
                        this.oxygenDiv.addClass('danger');
                    } else if (currentTube.player.oxygen <= 50) {
                        this.oxygenDiv.addClass('warning');
                    }
                }
            }this.oxygenDiv
        },

        printGameState: function(data) {
            $(".game-info").html(JSON.stringify(data, null, 2));
        },

        onGameDisconnect: function(callback) {
            setTimeout(function() {
                window.location.reload();
            }, 1000);
        },

        logMessages: function(message) {
            $("<div>").html(message).hide().appendTo('.radio .messages').fadeIn();
        },

        startLoader: function(argument) {
            $( ".ship" ).animate({ "left": "+=100%" }, 2900 );
        },
        displayMap: function(){
            $(".loading").fadeOut(function(){
                $('.game .mars-map').show();
            });
        },
        displayMenu: function(){
            $(".loader").fadeOut(function(){
                $('.register .menu ').fadeIn();
            });
        }
    });

    var app = new App();
});

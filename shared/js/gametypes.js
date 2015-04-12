Types = {
    Messages: {
        INIT: 0,
        DISCONNECT: 1,
        NEWGAME: 2,
        GAMESTATE: 3,
        GAMESINFO: 4,
        ENTERGAME: 5,
        RADIO: 6,
        MAP: 7
    },

    Entities: {
        PLAYER: 1,
    },

    States: {
        WAITING: 1,
        READY: 2,
        RUNNING: 3,
        FINISHED: 4
    },

    Actions: {
    }
};

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}

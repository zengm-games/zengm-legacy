/**
 * @name core.gameSim
 * @namespace Individual game simulation.
 */
define(["core/gamesim/gameSimBaseball","lib/underscore", "util/helpers", "util/random"], function (gamesimSport,_, helpers, random) {
    "use strict";


    return {
        GameSim: gamesimSport.GameSim
    };
});

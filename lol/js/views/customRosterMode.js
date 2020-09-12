/**
 * @name views.godMode
 * @namespace Enable or disable God Mode.
 */
define(["globals", "ui", "core/league", "util/bbgmView", "util/helpers"], function (g, ui, league, bbgmView, helpers) {
    "use strict";

    function updateCustomRosterMode(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("toggleCustomRosterMode") >= 0) {
            // Make sure it's current
            return league.loadGameAttribute(null, "customRosterMode").then(function () {
                return {
                    customRosterMode: g.customRosterMode
                };
            });
        }
    }

    function uiFirst() {
        ui.title("Custom Roster Mode");

        document.getElementById("enable-custom-roster-mode").addEventListener("click", function () {
            league.setGameAttributesComplete({customRosterMode: true, godModeInPast: true}).then(function () {
                league.updateLastDbChange();			
                ui.realtimeUpdate(["toggleCustomRosterMode"], helpers.leagueUrl(["custom_roster_mode"]));
            });
        });

        document.getElementById("disable-custom-roster-mode").addEventListener("click", function () {
            league.setGameAttributesComplete({customRosterMode: false}).then(function () {
                league.updateLastDbChange();			
                ui.realtimeUpdate(["toggleCustomRosterMode"], helpers.leagueUrl(["custom_roster_mode"]));
            });
        });
    }

    return bbgmView.init({
        id: "customRosterMode",
        runBefore: [updateCustomRosterMode],
        uiFirst: uiFirst
    });
});
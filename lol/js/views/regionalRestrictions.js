/**
 * @name views.godMode
 * @namespace Enable or disable God Mode.
 */
define(["globals", "ui", "core/league", "util/bbgmView", "util/helpers"], function (g, ui, league, bbgmView, helpers) {
    "use strict";

    function updateRegionalRestrictions(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("toggleRegionalRestrictions") >= 0) {
            // Make sure it's current
            return league.loadGameAttribute(null, "regionalRestrictions").then(function () {
                return {
                    regionalRestrictions: g.regionalRestrictions
                };
            });
        }
    }

    function uiFirst() {
        ui.title("Regional Restrictions");

        document.getElementById("enable-regional-restrictions").addEventListener("click", function () {
            league.setGameAttributesComplete({regionalRestrictions: true, godModeInPast: true}).then(function () {
                league.updateLastDbChange();			
                ui.realtimeUpdate(["toggleRegionalRestrictions"], helpers.leagueUrl(["regional_restrictions"]));
            });
        });

        document.getElementById("disable-regional-restrictions").addEventListener("click", function () {
            league.setGameAttributesComplete({regionalRestrictions: false}).then(function () {
                league.updateLastDbChange();			
                ui.realtimeUpdate(["toggleRegionalRestrictions"], helpers.leagueUrl(["regional_restrictions"]));
            });
        });
    }

    return bbgmView.init({
        id: "regionalRestrictions",
        runBefore: [updateRegionalRestrictions],
        uiFirst: uiFirst
    });
});

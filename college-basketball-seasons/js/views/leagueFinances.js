/**
 * @name views.schedule
 * @namespace Show current schedule for user's team.
 */
define(["globals", "ui", "core/team", "lib/jquery", "lib/knockout", "lib/underscore", "util/bbgmView", "util/helpers", "util/viewHelpers", "views/components"], function (g, ui, team, $, ko, _, bbgmView, helpers, viewHelpers, components) {
    "use strict";

    var mapping;

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
    }

    mapping = {
        teams: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateLeagueFinances(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || inputs.season !== vm.season() || inputs.season === g.season) {
            return team.filter({
				attrs: ["tid","cid","did", "abbrev", "region", "name"],
                seasonAttrs: ["att", "revenue", "profit", "cash", "payroll", "salaryPaid","hype"],				
                season: inputs.season
            }).then(function (teams) {
				var removeConference,removeDivision,i;
				
                for (i = 0; i < teams.length; i++) {
                    teams[i].teamDiv = g.divs[teams[i].did].name;
					removeDivision = teams[i].teamDiv;
					removeDivision = removeDivision.replace('Mid West -','');
					removeDivision = removeDivision.replace('ACC -','');
					removeDivision = removeDivision.replace('PCC -','');
					removeDivision = removeDivision.replace('SEC -','');
					removeDivision = removeDivision.replace('Big North -','');
					removeDivision = removeDivision.replace('Deep South -','');
					removeDivision = removeDivision.replace('West Ocean -','');
					removeDivision = removeDivision.replace('Desert -','');
					removeDivision = removeDivision.replace('California -','');
					removeDivision = removeDivision.replace('Rocky -','');
					removeDivision = removeDivision.replace('New England -','');
					removeDivision = removeDivision.replace('Capital -','');
					removeDivision = removeDivision.replace('Florida -','');
					removeDivision = removeDivision.replace('Breadbasket -','');
					removeDivision = removeDivision.replace('Chicago -','');
					removeDivision = removeDivision.replace('Great Lakes -','');
					removeDivision = removeDivision.replace('New Empire -','');
					removeDivision = removeDivision.replace('Carolina -','');
					removeDivision = removeDivision.replace('Swing State -','');
					removeDivision = removeDivision.replace('Ranch -','');					
                    teams[i].teamDiv = removeDivision;
					
                    teams[i].teamConf = g.confs[teams[i].cid].name;
					removeConference = teams[i].teamConf;
					removeConference = removeConference.replace('Conference','');
                    teams[i].teamConf = removeConference;
					
                    teams[i].hype *= 100;
               //     teams[i].hype = Math.round(teams[i].hype);
					//console.log(teams[i].hype);
                }			
			
                return {
                    season: inputs.season,
                    salaryCap: g.salaryCap,
                    minPayroll: g.minPayroll,
                    luxuryPayroll: g.luxuryPayroll,
                    luxuryTax: g.luxuryTax,
                    teams: teams
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Association Budgets - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatableSinglePage($("#league-finances"), 5, _.map(vm.teams(), function (t) {
                var payroll;
                payroll = season === g.season ? t.payroll : t.salaryPaid;  // Display the current actual payroll for this season, or the salary actually paid out for prior seasons
//                return ['<a href="' + helpers.leagueUrl(["team_finances", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', helpers.numberWithCommas(helpers.round(t.att)), helpers.formatCurrency(t.revenue, ""), helpers.formatCurrency(t.profit, ""), helpers.formatCurrency(t.cash, ""), helpers.formatCurrency(payroll, "")];
//                return ['<a href="' + helpers.leagueUrl(["team_finances", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', helpers.numberWithCommas(helpers.round(t.att)), helpers.formatCurrency(t.cash, "")];
//                return ['<a href="' + helpers.leagueUrl(["team_finances", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', helpers.formatCurrency(t.cash, "")];
              ////  return ['<a href="' + helpers.leagueUrl(["team_finances", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', helpers.formatCurrency(t.cash, ""),helpers.round( t.hype, 0),t.teamConf,t.teamDiv];

			//}));
			
                return ['<a href="' + helpers.leagueUrl(["team_finances", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', helpers.formatCurrency(t.cash, ""),helpers.round( t.hype, 0),t.teamConf,t.teamDiv, t.tid === g.userTid];
            }), {
                fnRowCallback: function (nRow, aData) {

                    // Highlight user team
                    if (aData[aData.length - 1]) {
                        nRow.classList.add("info");
                    }
                }
            });			
			
		//	);			
			
        }).extend({throttle: 1});

        ui.tableClickableRows($("#league-finances"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("league-finances-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "leagueFinances",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateLeagueFinances],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});
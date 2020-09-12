/**
 * @name views.draftSummary
 * @namespace Draft summary.
 */
define(["dao", "globals", "ui", "core/player", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, $, ko, _, components, bbgmView, helpers) {
    "use strict";

    var mapping;

    function get(req) {
        var season;

        season = helpers.validateSeason(req.params.season);

        // Draft hasn't happened yet this year
        if (g.phase < g.PHASE.DRAFT) {
            if (g.season === g.startingSeason) {
                // No draft history
                return {
                    redirectUrl: helpers.leagueUrl(["draft_scouting"])
                };
            }
            if (season === g.season) {
                // View last season by default
                season = g.season - 1;
            }
        }

        return {
            season: season
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
    }

    mapping = {
        players: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateDraftSummary(inputs) {
        // Update every time because anything could change this (unless all players from class are retired)
        return dao.players.getAll({
            index: "draft.year",
            key: inputs.season,
            statsSeasons: "all"
        }).then(function (playersAll) {
            var currentPr, i, p, pa, players;

            playersAll = player.filter(playersAll, {
                attrs: ["tid", "abbrev", "draft", "pid", "name", "pos", "age"],
                ratings: ["ovr", "pot", "skills"],
                stats: ["gp","min", "pts", "trb", "ast", "per","tp","fg","fga","fgp","kda"],
				//["gp", "min", "pts", "trb", "ast", "per"],
                showNoStats: true,
                showRookies: true,
                fuzz: true
            });

            players = [];
            for (i = 0; i < playersAll.length; i++) {
                pa = playersAll[i];

               // if (pa.draft.round === 1 || pa.draft.round === 2) {
                    // Attributes
                    p = {pid: pa.pid, name: pa.name, pos: pa.pos, draft: pa.draft, currentAge: pa.age, currentAbbrev: pa.abbrev};

                    // Ratings
                    currentPr = _.last(pa.ratings);
                    if (pa.tid !== g.PLAYER.RETIRED) {
                        p.currentOvr = currentPr.ovr;
                        p.currentPot = currentPr.pot;
                        p.currentSkills = currentPr.skills;
                    } else {
                        p.currentOvr = "";
                        p.currentPot = "";
                        p.currentSkills = "";
                    }
					p.draft.ovr = pa.ratings[0].ovr;
					p.draft.pot = pa.ratings[0].pot;
					
				//	console.log(p.draft.ovr+" "+p.draft.pot+" "+pa.ratings.length+" "+pa.ratings[0].ovr+" "+pa.ratings[0].pot);
                    // Stats
                    p.careerStats = pa.careerStats;

                    players.push(p);
              //  }
            }

            return {
                season: inputs.season,
                players: players
            };
        });
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title(vm.season() + " Draft Summary");
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatableSinglePage($("#draft-results"), 0, _.map(vm.players(), function (p) {
                return ['<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>', p.pos, String(p.draft.age), String(p.draft.ovr), String(p.draft.pot), '<span class="skills-alone">' + helpers.skillsBlock(p.draft.skills) + '</span>', '<a href="' + helpers.leagueUrl(["roster", p.currentAbbrev]) + '">' + p.currentAbbrev + '</a>', String(p.currentAge), String(p.currentOvr), String(p.currentPot), '<span class="skills-alone">' + helpers.skillsBlock(p.currentSkills) + '</span>', helpers.round(p.careerStats.gp), helpers.round(p.careerStats.min, 1), helpers.round(p.careerStats.fg, 1), helpers.round(p.careerStats.fga, 1), helpers.round(p.careerStats.fgp, 1), helpers.round(p.careerStats.kda, 1), helpers.round(p.careerStats.tp, 1)];
            }));
        }).extend({throttle: 1});

        ui.tableClickableRows($("#draft-results"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("draft-summary-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "draftSummary",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateDraftSummary],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});
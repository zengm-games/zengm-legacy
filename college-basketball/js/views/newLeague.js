/**
 * @name views.newLeague
 * @namespace Create new league form.
 */
define(["dao", "ui", "core/league", "lib/bluebird", "lib/jquery", "lib/knockout", "lib/knockout.mapping", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (dao, ui, league, Promise, $, ko, komapping, bbgmView, helpers, viewHelpers) {

    "use strict";

	 function InitViewModel() {
        this.invalidLeagueFile = ko.observable(false);
        this.uploadSelected = ko.observable(false);
        this.disableSubmit = ko.computed(function () {
            return this.invalidLeagueFile() && this.uploadSelected();
        }, this);
    }

    // Keep only relevant information, otherwise Knockout has to do extra work creating all kinds of observables
    function removeUnneededTeamProps(teams) {
        var i, prop, propsToKeep;

        // These are used in newLeague.html and updatePopText
        propsToKeep = ["name", "pop", "popRank", "region", "tid"];

        for (i = 0; i < teams.length; i++) {
            // Remove unneeded properties
            for (prop in teams[i]) {
                if (teams[i].hasOwnProperty(prop)) {
                    if (propsToKeep.indexOf(prop) === -1) {
                        delete teams[i][prop];
                    }
                }
            }
        }

        return teams;
    }

    function post(req) {
        Promise.try(function () {
            var file, startingSeason, tid, typeid;

            document.getElementById("create-new-league").disabled = true;

			// season.js 2371 to 2395 needs to be updated
            startingSeason = 2019;

            tid = parseInt(req.params.tid, 10);
            localStorage.lastSelectedTid = tid;
			typeid = parseInt(req.params.typeid, 10);

            // Davis.js can't handle file uploads, so do this manually first
            if (req.params.rosters === "custom-rosters") {
                file = document.getElementById("custom-rosters-file").files[0];
                if (file !== undefined) {
                    return new Promise(function (resolve) {
                        var reader;

                        reader = new window.FileReader();
                        reader.readAsText(file);
                        reader.onload = function (event) {
                            var leagueFile, randomizeRosters;

                            leagueFile = JSON.parse(event.target.result);

                            startingSeason = leagueFile.startingSeason !== undefined ? leagueFile.startingSeason : startingSeason;

                            randomizeRosters = req.params.hasOwnProperty("randomize-rosters");

                            league.create(req.params.name, tid, typeid, leagueFile, startingSeason, randomizeRosters).then(resolve);
                        };
                    });
                }
            }

            return league.create(req.params.name, tid,typeid,  null, startingSeason, false);
        }).then(function (lid) {
            ui.realtimeUpdate([], "/l/" + lid, function () {
                // Show helpful information if this is the first league
                if (lid === 1) {
                    ui.highlightPlayButton();
                }
            });
        });
    }

    function updateNewLeague() {
        var newLid;

        newLid = null;

        // Find most recent league and add one to the LID
        return dao.leagues.iterate({
            direction: "prev",
            callback: function (l, shortCircuit) {
                newLid = l.lid + 1;
                shortCircuit();
            }
        }).then(function () {
            var teams, gameType;

            if (newLid === null) {
                newLid = 1;
            }

			gameType = helpers.getGameType();

            teams = removeUnneededTeamProps(helpers.getTeams80Default());
            teams.unshift({
                tid: -1,
                region: "Random",
                name: "Team"
            });

            return {
                name: "Association " + newLid,
                teams: teams,
				gameType: gameType,
                lastSelectedTid: parseInt(localStorage.lastSelectedTid, 10)
            };
        });
    }

    function uiFirst(vm) {
        var fileEl, newLeagueRostersEl, selectRosters, selectTeam, setTeams, updatePopText, updateShowUploadForm, useCustomTeams;
		var selectGameType;
		var updateShowUploadForm2;
		var setTeams2;
		var useGameTypeTeams;
		var gameTypeEl;

        ui.title("Create New Association");

        updatePopText = function () {
            var difficulty, ratio, team;

            team = vm.teams()[parseInt(selectTeam.val(), 10) + 1];

           if (selectGameType.val() == 0) {
				ratio = 1;
            } else {
				ratio = 4;
            }


            if (team.tid() >= 0) {
               if (team.popRank() <= 10*ratio) {
                    difficulty = "very easy";
                } else if (team.popRank() <= 25*ratio) {
                    difficulty = "easy";
                } else if (team.popRank() <= 55*ratio) {
                    difficulty = "normal";
                } else if (team.popRank() <= 70*ratio) {
                    difficulty = "hard";
                } else {
                    difficulty = "very hard";
                }


                /*if (team.popRank() <= 40) {
                    difficulty = "very easy";
                } else if (team.popRank() <= 100) {
                    difficulty = "easy";
                } else if (team.popRank() <= 220) {
                    difficulty = "normal";
                } else if (team.popRank() <= 280) {
                    difficulty = "hard";
                } else {
                    difficulty = "very hard";
                }*/
             //   console.log(team.state);
//                document.getElementById("pop-text").innerHTML = "Starting Difficulty Rank: #" + team.popRank() + " leaguewide, " + difficulty + "<br> State: "+team.state;
                document.getElementById("pop-text").innerHTML = "Starting Difficulty Rank: #" + team.popRank() + " leaguewide, " + difficulty;
            } else {
                document.getElementById("pop-text").innerHTML = "Starting Difficulty Rank: ?";
            }
        };

        selectGameType = $("select[name='typeid']");
        selectGameType.change(updateShowUploadForm2);

        selectTeam = $("select[name='tid']");
        selectTeam.change(updatePopText);
        selectTeam.keyup(updatePopText);

        updateShowUploadForm = function () {
            if (selectRosters.val() === "custom-rosters") {
                $("#custom-rosters").show();
                $("#randomize-rosters").show();
                vm.uploadSelected(true);
            } else {
                $("#custom-rosters").hide();
                $("#randomize-rosters").hide();
                vm.uploadSelected(false);
            }
        };

        selectRosters = $("select[name='rosters']");
        selectRosters.change(updateShowUploadForm);
        selectRosters.keyup(updateShowUploadForm);

        updatePopText();
        updateShowUploadForm();

        // Handle custom roster teams
        setTeams = function (newTeams,ratio) {
            var i;

            if (newTeams !== undefined) {
                for (i = 0; i < newTeams.length; i++) {
                    // Is pop hidden in season, like in editTeamInfo import?
                    if (!newTeams[i].hasOwnProperty("pop") && newTeams[i].hasOwnProperty("seasons")) {
                        newTeams[i].pop = newTeams[i].seasons[newTeams[i].seasons.length - 1].pop;
                    }

                    newTeams[i].pop = helpers.round(newTeams[i].pop, 2);
                }

                newTeams = helpers.addPopRank(newTeams);

                newTeams = removeUnneededTeamProps(newTeams);

                // Add random team
                newTeams.unshift({
                    tid: -1,
                    region: "Random",
                    name: "Team"
                });

                komapping.fromJS({teams: newTeams}, vm);
            }

            updatePopText();
        };
        useCustomTeams = function () {
            var file, reader;

            if (fileEl.files.length) {

                vm.invalidLeagueFile(false);

                file = fileEl.files[0];

                reader = new window.FileReader();
                reader.readAsText(file);
                reader.onload = function (event) {
                    var leagueFile, newTeams;

                    try {
                        leagueFile = JSON.parse(event.target.result);
                    } catch (e) {
                        vm.invalidLeagueFile(true);
                        return;
                    }
                    newTeams = leagueFile.teams;
                    setTeams(newTeams);

                    // Is a userTid specified?
                    if (leagueFile.hasOwnProperty("gameAttributes")) {
                        leagueFile.gameAttributes.some(function (attribute) {
                            if (attribute.key === "userTid") {
                                // Set it to select the userTid entry
                                document.getElementById("new-league-tid").value = attribute.value;
                                updatePopText(); // Not caught by event handlers for some reason
                                return true;
                            }
                        });
                    }
                };
            }
        };

        gameTypeEl = document.getElementById("new-league-typeid");
		gameTypeEl.addEventListener("change", function () {
            if (this.value == 0) {
                setTeams(helpers.getTeams80Default(),1);
            } else {
                setTeams(helpers.getTeams320Default(),4);
            }


        });


        fileEl = document.getElementById("custom-rosters-file");
        fileEl.addEventListener("change", useCustomTeams);
        // Handle switch away from custom roster teams
        newLeagueRostersEl = document.getElementById("new-league-rosters");
        newLeagueRostersEl.addEventListener("change", function () {
            if (this.value === "custom-rosters") {
                useCustomTeams();
            } else {
             //   setTeams(helpers.getTeamsDefault());
				if (selectGameType.val() == 0) {
					setTeams(helpers.getTeams80Default());
				} else {
					setTeams(helpers.getTeams320Default());
				}
            }
        });
    }

    return bbgmView.init({
        id: "newLeague",
        beforeReq: viewHelpers.beforeNonLeague,
        InitViewModel: InitViewModel,
        post: post,
        runBefore: [updateNewLeague],
        uiFirst: uiFirst
    });
});

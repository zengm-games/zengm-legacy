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
            var file, startingSeason, tid, typeid,patchid;

            document.getElementById("create-new-league").disabled = true;

            startingSeason = 2020;

            tid = parseInt(req.params.tid, 10);
			typeid = Math.floor(req.params.typeid);
 			patchid = Math.floor(req.params.patchid);

            localStorage.lastSelectedTid = tid;
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
                            league.create(req.params.name, tid,typeid,patchid, leagueFile, startingSeason, randomizeRosters).then(resolve);
                        };
                    });
                }
            }

            return league.create(req.params.name, tid,typeid,patchid, null, startingSeason, false);
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
            var teams,gameType,patchType;

            if (newLid === null) {
                newLid = 1;
            }

			gameType = helpers.getGameType();
			patchType = helpers.getPatchType();

            teams = removeUnneededTeamProps(helpers.getTeamsNADefault());
            teams.unshift({
                tid: -1,
                region: "Random",
                name: "Team"
            });

            return {
                name: "League " + newLid,
                teams: teams,
				gameType: gameType,
				patchType: patchType,
                lastSelectedTid: parseInt(localStorage.lastSelectedTid, 10)
            };
        });
    }

    function uiFirst(vm) {
        var fileEl, newLeagueRostersEl, selectRosters, selectTeam, setTeams, updatePopText, updateShowUploadForm, useCustomTeams;
		var selectGameType,selectPatchType,gameTypeEl;
        ui.title("Create New League");

        updatePopText = function () {
            var difficulty, team,ratio;

            team = vm.teams()[parseInt(selectTeam.val(), 10) + 1];

           if (selectGameType.val() == 0) {
				ratio = 1;
            } else if (selectGameType.val() == 1) {
				ratio = 3;
            } else if (selectGameType.val() == 2) {
				ratio = 1;
            } else if (selectGameType.val() == 3) {
				ratio = 1;
            } else if (selectGameType.val() == 4) {
				ratio = 1;
            } else {
				ratio = 5;
            }

            if (team.tid() >= 0) {
                if (team.popRank() <= 2*ratio) {
                    difficulty = "very easy";
                } else if (team.popRank() <= 4*ratio) {
                    difficulty = "easy";
                } else if (team.popRank() <= 6*ratio) {
                    difficulty = "normal";
                } else if (team.popRank() <= 8*ratio) {
                    difficulty = "hard";
                } else {
                    difficulty = "very hard";
                }

                document.getElementById("pop-text").innerHTML = "Starting Difficulty Rank: #" + team.popRank() + " leaguewide <br>Difficulty: " + difficulty;
            } else {
//                document.getElementById("pop-text").innerHTML = "Region population: ?<br>Difficulty: ?";
                document.getElementById("pop-text").innerHTML = "Starting Difficulty Rank: ?";
            }
        };

        selectGameType = $("select[name='typeid']");
        selectPatchType = $("select[name='patchid']");
//        selectGameType.change(updateShowUploadForm2);
   //     selectGameType.change(updateShowUploadForm);

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
        setTeams = function (newTeams) {
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

            if (this.value == -2) {
                setTeams(helpers.getTeamsDefaultEU(),3);
            } else if (this.value == -1) {
                setTeams(helpers.getTeamsEUDefault(),1);
            } else if (this.value == 0) {
                setTeams(helpers.getTeamsNADefault(),1);
            } else if (this.value == 1) {
                setTeams(helpers.getTeamsDefault(),3);
            } else if (this.value == 2) {
                setTeams(helpers.getTeamsLCKDefault(),1);
            } else if (this.value == 3) {
                setTeams(helpers.getTeamsLPLDefault(),1);
            } else if (this.value == 4) {
                setTeams(helpers.getTeamsLMSDefault(),1);
            } else {
                setTeams(helpers.getTeamsWorldsDefault(),5);
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

				if (selectGameType.val() == 0) {
					setTeams(helpers.getTeamsNADefault());
				} else if (selectGameType.val() == 1) {
					setTeams(helpers.getTeamsDefault());
				} else if (selectGameType.val() == 2) {
					setTeams(helpers.getTeamsLCKDefault());
				} else if (selectGameType.val() == 3) {
					setTeams(helpers.getTeamsLPLDefault());
				} else if (selectGameType.val() == 4) {
					setTeams(helpers.getTeamsLMSDefault());
				} else {
					setTeams(helpers.getTeamsWorldsDefault());
				}
                //setTeams(helpers.getTeamsDefault());
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

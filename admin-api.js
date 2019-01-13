const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();

function checkVoteMode(voteMode) {
    if (voteMode != 'std' && voteMode != 'registration') {
        return false
    }
    return true;
}

api.patch('/teams/:teamname/size', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let size = req.body.size;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/size`);
    if (hashedTeamname === undefined || size === undefined || size < 0) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or size is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname)
        teams.get(teamname).teamSize.size = size;
        teams.recalculatePizzaCount(teamname);
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

api.patch('/teams/:teamname/size/type', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let type = req.body.type;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/size/type`);
    if (hashedTeamname === undefined || type === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or type is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else if (!(type === 'persons' || type === 'pizzaPieces')) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: type value is not supported' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).teamSize.type = type;
        teams.recalculatePizzaCount(teamname);
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

api.patch('/teams/:teamname/vegetarian', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let size = req.body.size;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/vegetarian`);
    if (hashedTeamname === undefined || size === undefined || size < 0) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or vegetarian is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).vegetarian = size;
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

api.patch('/teams/:teamname/no-pork', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let size = req.body.size;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/no-pork`);
    if (hashedTeamname === undefined || size === undefined || size < 0) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or size is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).pork = size;
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

api.patch('/teams/:teamname/vote-mode', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let voteMode = req.body.voteMode;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/vote-mode`);
    if (hashedTeamname === undefined || voteMode === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else if (!checkVoteMode(voteMode)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: this voteMode is not supported' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).voteMode = voteMode;
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

api.patch('/teams/:teamname/freeze', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let freeze = req.body.freeze;
    console.log(`[Log] PATCH /teams/${hashedTeamname}/freeze`);
    if (hashedTeamname === undefined || freeze === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).freeze = freeze;
        res.status(200).end(JSON.stringify(teams.get(teamname)));
    }
});

module.exports = api;
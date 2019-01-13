const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();

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

module.exports = api;
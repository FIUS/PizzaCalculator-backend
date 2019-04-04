const express = require('express');
const api = express();
const crypto = require('crypto');
const timeoutInMS = 28800000;
const Teams = require('../controller/teams');
const teams = new Teams();

api.post('/teams', (req, res, next) => {
    let teamname = req.body.teamname;
    // teamname is not undefined and teamname is not currently used
    if (teamname != undefined && !teams.has(teamname)) {
        let data = {
            name: teamname,
            hashedName: crypto.createHash('sha256').update(teamname).digest('hex'),
            teamSize: {
                size: 0,
                type: 'persons'
            },
            pizzaCount: 0,
            voteMode: 'std',
            freeze: false,
            vegetarian: 0,
            noPork: 0
        };
        teams.set(teamname, data);
        teams.setHash(data.hashedName, teamname);
        // Delete team after given time
        setTimeout(() => {
            teams.remove(teamname);
        }, timeoutInMS);
        res.status(201).end(JSON.stringify(data));
    } else if (teamname === undefined) {
        res.send(400).end(JSON.stringify({ error: 'Bad Request: teamname is undefined' }));
    } else {
        res.send(409).end(JSON.stringify({ error: 'Conflict: teamname is already used' }));
    }
});

api.get('/teams', (req, res, next) => {
    res.status(200).end(JSON.stringify(teams.keys()));
});

api.get('/teams/:teamname/vote-mode', (req, res, next) => {
    let teamname = req.params.teamname;
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        res.status(200).end(JSON.stringify({ voteMode: teams.get(teamname).voteMode }));
    }
});

api.get('/teams/:teamname/freeze', (req, res, next) => {
    let teamname = req.params.teamname;
    console.log(`[Log] GET /teams/${teamname}/freeze`);
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        res.status(200).end(JSON.stringify({ freeze: teams.get(teamname).freeze }));
    }
});

module.exports = api;
const express = require('express');
const api = express();
const crypto = require('crypto');
const timeoutInMS = 28800000; // TODO read timeout from environment variable or command line param
const Teams = require('../controller/teams');
const teams = new Teams();

api.post('/teams', (req, res, next) => {
    let teamname = req.body.teamname;
    let public = req.body.public;
    // teamname is not undefined and teamname is not currently used
    if (teamname != undefined && req.body.public != undefined && !teams.has(teamname)) {
        let data = {
            name: teamname,
            hashedName: crypto.createHash('sha256').update(teamname).digest('hex'),
            teamSize: {
                size: 0,
                type: 'persons'
            },
            public: public,
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
        res.status(201).json(data);
    } else if (teamname === undefined) {
        res.json(409, { message: 'Bad Request: teamname is undefined' });
    } else {
        res.json(409, { message: 'Conflict: teamname is already used' });
    }
});

api.get('/teams', (req, res, next) => {
    res.status(200).json(teams.getPublicTeams());
});

api.get('/teams/:teamname/vote-mode', (req, res, next) => {
    let teamname = req.params.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        res.status(200).json({ voteMode: teams.get(teamname).voteMode });
    }
});

api.get('/teams/:teamname/freeze', (req, res, next) => {
    let teamname = req.params.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        res.status(200).json({ freeze: teams.get(teamname).freeze });
    }
});

module.exports = api;
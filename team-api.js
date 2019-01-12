const express = require('express');
const api = express();
const crypto = require('crypto');
const timeoutInMS = 28800000;
const Teams = require('./teams');
const teams = new Teams();

api.post('/teams', (req, res, next) => {
    console.log('[Log] POST /teams');
    let teamname = req.body.teamname;
    // teamname is not undefined and teamname is not currently used
    if (teamname != undefined && !teams.has(teamname)) {
        let data = {
            name: teamname,
            hashedName: crypto.createHash('sha256').update(teamname).digest('hex'),
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
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
    console.log('[Log] GET /teams');
    res.status(200).end(JSON.stringify(teams.keys()));
});

module.exports = api;
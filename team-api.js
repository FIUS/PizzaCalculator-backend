const express = require('express');
const api = express();
const HashMap = require('hashmap');
const timeoutInMS = 28800000;

let teams = new HashMap();

api.post('/teams', (req, res, next) => {
    let teamname = req.body.teamname;
    // teamname is not undefined and teamname is not currently used
    if (teamname != undefined && !teams.has(teamname)) {
        let data = {
            name: teamname,
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
        };
        teams.set(teamname, data);
        // Delete team after given time
        setTimeout(() => {
            teams.remove(teamname);
        }, timeoutInMS);
        res.status(201).end(JSON.stringify(data));
    } else if (teamname === undefined) {
        res.send(400).end('Bad Request: teamname is undefined');
    } else {
        res.send(409).end('Conflict: teamname is already used');
    }
});
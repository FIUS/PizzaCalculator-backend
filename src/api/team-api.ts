import express = require('express');
const api = express();
const crypto = require('crypto');
import Teams = require('../controller/teams');
const teams: Teams = new Teams();

let timeoutInMS: number = 28800000;
if (process.env.TIMEOUT_IN_MS != null) {
    let envTimeout: number = parseInt(process.env.TIMEOUT_IN_MS);
    if (!isNaN(envTimeout)) {
        console.log("Found valid environment variable TIMEOUT_IN_MS. Setting timeout to delete a team to %i", envTimeout);
        timeoutInMS = envTimeout;
    } else {
        console.log("The value \"%s\" is not a valid timeout", process.env.TIMEOUT_IN_MS);
    }
} else {
    console.log("Environment variable TIMEOUT_IN_MS not set. Using default timeout to delete a team.");
}

api.post('/teams', (req, res, next) => {
    let teamname: string = req.body.teamname;
    let publicFlag: boolean = req.body.public;
    // teamname is not undefined and teamname is not currently used
    if (teamname != undefined && publicFlag != undefined && !teams.has(teamname)) {
        let data: any = {
            name: teamname,
            hashedName: crypto.createHash('sha256').update(teamname).digest('hex'),
            teamSize: {
                size: 0,
                type: 'persons'
            },
            public: publicFlag,
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
            teams.remove(teamname, data.hashedName);
        }, timeoutInMS);
        res.status(201).json(data);
    } else if (teamname === undefined) {
        res.status(409).json( { message: 'Bad Request: teamname is undefined' });
    } else {
        res.status(409).json( { message: 'Conflict: teamname is already used' });
    }
});

api.get('/teams', (req, res, next) => {
    res.status(200).json(teams.getPublicTeams());
});

api.get('/teams/:name', (req, res, next) => {
    let teamname: string = req.params.name;
    if (teamname === undefined) {
        res.status(400).json({ message: "team name is undefined" });
    } else {
        res.status(200).json({ exists: teams.has(teamname) });
    }
});

api.get('/teams/:teamname/vote-mode', (req, res, next) => {
    let teamname: string = req.params.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        res.status(200).json({ voteMode: teams.get(teamname).voteMode });
    }
});

api.get('/teams/:teamname/freeze', (req, res, next) => {
    let teamname: string = req.params.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        res.status(200).json({ freeze: teams.get(teamname).freeze });
    }
});

export = api;
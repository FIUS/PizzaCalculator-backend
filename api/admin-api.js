const express = require('express');
const api = express();
const Teams = require('../controller/teams');
const teams = new Teams();

/**
 * List of property endpoints to autogenerate getter for all properties
 */
const numberPropertyEndpoints = [
    { endpoint: 'vegetarian', property: 'vegetarian' },
    { endpoint: 'no-pork', property: 'noPork' },
];

function checkVoteMode(voteMode) {
    if (voteMode != 'std' && voteMode != 'registration') {
        return false
    }
    return true;
}

api.patch('/teams/:teamname/size', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let size = req.body.size;
    if (hashedTeamname === undefined || size === undefined || size < 0) {
        res.json(403, { message: 'Bad request: teamname or size is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname)
        teams.get(teamname).teamSize.size = size;
        teams.recalculatePizzaCount(teamname);
        res.json(200, teams.get(teamname));
    }
});

api.get('/teams/:teamname/size', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    if (hashedTeamname === undefined) {
        res.json(403, { message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname)
        res.json(200, { size: teams.get(teamname).teamSize.size });
    }
});

api.get('/teams/:teamname/size/type', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    if (hashedTeamname === undefined) {
        res.json(403, { message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname)
        res.json(200, { type: teams.get(teamname).teamSize.type });
    }
});

api.patch('/teams/:teamname/size/type', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let type = req.body.type;
    if (hashedTeamname === undefined || type === undefined) {
        res.json(403, { message: 'Bad request: teamname or type is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else if (!(type === 'persons' || type === 'pizzaPieces')) {
        res.json(403, { message: 'Bad request: type value is not supported' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).teamSize.type = type;
        teams.recalculatePizzaCount(teamname);
        res.json(200, teams.get(teamname));
    }
});


numberPropertyEndpoints.forEach((endpoint) => {
    api.patch(`/teams/:teamname/${endpoint.endpoint}`, (req, res, next) => {
        let hashedTeamname = req.params.teamname;
        let amount = req.body[endpoint.property];
        if (hashedTeamname === undefined || amount === undefined || amount < 0) {
            res.json(403, { message: `Bad request: teamname or ${endpoint.property} is not defined` });
        } else if (!teams.hasHash(hashedTeamname)) {
            res.json(403, { message: 'Bad request: there is no such team' });
        } else {
            let teamname = teams.getTeamnameOfHash(hashedTeamname);
            teams.get(teamname)[endpoint.property] = amount;
            res.json(200, teams.get(teamname));
        }
    });

    api.get(`/teams/:teamname/${endpoint.endpoint}`, (req, res, next) => {
        let hashedTeamname = req.params.teamname;
        if (hashedTeamname === undefined) {
            res.json(403, { message: `Bad request: teamname is not defined` });
        } else if (!teams.hasHash(hashedTeamname)) {
            res.json(403, { message: 'Bad request: there is no such team' });
        } else {
            let teamname = teams.getTeamnameOfHash(hashedTeamname);
            res.json(200, { [endpoint.property]: teams.get(teamname)[endpoint.property] });
        }
    });
});

api.patch('/teams/:teamname/vote-mode', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let voteMode = req.body.voteMode;
    if (hashedTeamname === undefined || voteMode === undefined) {
        res.json(403, { message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else if (!checkVoteMode(voteMode)) {
        res.json(403, { message: 'Bad request: this voteMode is not supported' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).voteMode = voteMode;
        res.json(200, teams.get(teamname));
    }
});

api.patch('/teams/:teamname/freeze', (req, res, next) => {
    let hashedTeamname = req.params.teamname;
    let freeze = req.body.freeze;
    if (hashedTeamname === undefined || freeze === undefined) {
        res.json(403, { message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else {
        let teamname = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).freeze = freeze;
        res.json(200, teams.get(teamname));
    }
});

module.exports = api;
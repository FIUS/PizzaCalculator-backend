import express = require('express');
const api = express();
import Teams = require('../controller/teams');
const teams: Teams = new Teams();

/**
 * List of property endpoints to autogenerate getter for all properties
 */
const numberPropertyEndpoints: any[] = [
    { endpoint: 'vegetarian', property: 'vegetarian' },
    { endpoint: 'no-pork', property: 'noPork' },
];

function checkVoteMode(voteMode: string): boolean {
    if (voteMode != 'std' && voteMode != 'registration') {
        return false
    }
    return true;
}

api.patch('/teams/:teamname/size', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    let size: number = req.body.size;
    if (hashedTeamname === undefined || size === undefined || size < 0) {
        res.status(400).json({ message: 'Bad request: teamname or size is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname)
        teams.get(teamname).teamSize.size = size;
        teams.recalculatePizzaCount(teamname);
        res.status(200).json(teams.get(teamname));
    }
});

api.get('/teams/:teamname/size', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    if (hashedTeamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname)
        res.status(200).json({ size: teams.get(teamname).teamSize.size });
    }
});

api.get('/teams/:teamname/size/type', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    if (hashedTeamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname)
        res.status(200).json({ type: teams.get(teamname).teamSize.type });
    }
});

api.patch('/teams/:teamname/size/type', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    let type: string = req.body.type;
    if (hashedTeamname === undefined || type === undefined) {
        res.status(400).json({ message: 'Bad request: teamname or type is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else if (!(type === 'persons' || type === 'pizzaPieces')) {
        res.status(400).json({ message: 'Bad request: type value is not supported' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).teamSize.type = type;
        teams.recalculatePizzaCount(teamname);
        res.status(200).json(teams.get(teamname));
    }
});


numberPropertyEndpoints.forEach((endpoint) => {
    api.patch(`/teams/:teamname/${endpoint.endpoint}`, (req, res, next) => {
        let hashedTeamname: string = req.params.teamname;
        let amount: number = req.body[endpoint.property];
        if (hashedTeamname === undefined || amount === undefined || amount < 0) {
            res.status(400).json({ message: `Bad request: teamname or ${endpoint.property} is not defined` });
        } else if (!teams.hasHash(hashedTeamname)) {
            res.status(400).json({ message: 'Bad request: there is no such team' });
        } else {
            let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
            teams.get(teamname)[endpoint.property] = amount;
            res.status(200).json(teams.get(teamname));
        }
    });

    api.get(`/teams/:teamname/${endpoint.endpoint}`, (req, res, next) => {
        let hashedTeamname: string = req.params.teamname;
        if (hashedTeamname === undefined) {
            res.status(400).json({ message: `Bad request: teamname is not defined` });
        } else if (!teams.hasHash(hashedTeamname)) {
            res.status(400).json({ message: 'Bad request: there is no such team' });
        } else {
            let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
            res.status(200).json({ [endpoint.property]: teams.get(teamname)[endpoint.property] });
        }
    });
});

api.patch('/teams/:teamname/vote-mode', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    let voteMode: string = req.body.voteMode;
    if (hashedTeamname === undefined || voteMode === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else if (!checkVoteMode(voteMode)) {
        res.status(400).json({ message: 'Bad request: this voteMode is not supported' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).voteMode = voteMode;
        res.status(200).json(teams.get(teamname));
    }
});

api.patch('/teams/:teamname/freeze', (req, res, next) => {
    let hashedTeamname: string = req.params.teamname;
    let freeze: boolean = req.body.freeze;
    if (hashedTeamname === undefined || freeze === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
        teams.get(teamname).freeze = freeze;
        res.status(200).json(teams.get(teamname));
    }
});

export = api;
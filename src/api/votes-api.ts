import express = require('express');
const api = express();
import Teams = require('../controller/teams');
const teams: Teams = new Teams();
import Pizzas = require('../controller/pizzas');
const pizzas: Pizzas = new Pizzas();

api.patch('/pizzas/:name', (req, res, next) => {
    let teamname: string = req.body.teamname;
    let suggestionName: string = req.params.name;
    let mode: string = req.query.mode;
    if (teamname === undefined || suggestionName === undefined || mode === undefined) {
        res.status(400).json({ message: 'Bad request: mode, teamname or name of pizza is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else if (mode == 'up' || mode == 'down'){
        try {
            pizzas.revoteSuggestionOfTeam(suggestionName, teamname, mode);
            res.status(200).json({ message: 'OK: Suggestion is revoted' });
        } catch (error) {
            res.status(400).json({ message: 'Bad request: there is no such suggestion for the team' });
        }
    } else {
        res.status(400).json({ message: 'Bad request: mode value is not supported' });
    }
});

api.get('/pizzas/:name/vote', (req, res, next) => {
    let teamname: string = req.query.teamname;
    let suggestionName: string = req.params.name;
    if (teamname === undefined || suggestionName === undefined) {
        res.status(400).json({ message: 'Bad request: teamname or pizza name is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        try {
            res.status(200).json({ vote: pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, 'vote') });
        } catch (error) {
            res.status(400).json({ message: 'Bad request: there is no such suggestion' });
        }
    }
});

export = api;
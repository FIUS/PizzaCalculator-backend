const express = require('express');
const api = express();
const Teams = require('../controller/teams');
const teams = new Teams();
const Pizzas = require('../controller/pizzas');
const pizzas = new Pizzas();

api.patch('/pizzas/:name', (req, res, next) => {
    let teamname = req.body.teamname;
    let suggestionName = req.params.name;
    let mode = req.query.mode;
    if (teamname === undefined || suggestionName === undefined || mode === undefined) {
        res.json(403, { message: 'Bad request: mode, teamname or name of pizza is not defined' });
    } else if (!teams.has(teamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else if (mode == 'up' || mode == 'down'){
        try {
            pizzas.revoteSuggestionOfTeam(suggestionName, teamname, mode);
            res.json(200, { message: 'OK: Suggestion is revoted' });
        } catch (error) {
            res.json(403, { message: 'Bad request: there is no such suggestion for the team' });
        }
    } else {
        res.json(403, { message: 'Bad request: mode value is not supported' });
    }
});

api.get('/pizzas/:name/vote', (req, res, next) => {
    let teamname = req.query.teamname;
    let suggestionName = req.params.name;
    if (teamname === undefined || suggestionName === undefined) {
        res.json(403, { message: 'Bad request: teamname or pizza name is not defined' });
    } else if (!teams.has(teamname)) {
        res.json(403, { message: 'Bad request: there is no such team' });
    } else {
        try {
            res.json(200, { vote: pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, 'vote') });
        } catch (error) {
            res.json(403, { message: 'Bad request: there is no such suggestion' });
        }
    }
});

module.exports = api;
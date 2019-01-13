const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();
const Pizzas = require('./pizzas');
const pizzas = new Pizzas();

api.patch('/pizzas/:name', (req, res, next) => {
    let teamname = req.body.teamname;
    let suggestionName = req.params.name;
    let mode = req.query.mode;
    console.log(`[Log] DELETE /pizzas/${suggestionName}/?mode=${mode}`);
    if (teamname === undefined || suggestionName === undefined || mode === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: mode, teamname or name of pizza is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else if (mode == 'up' || mode == 'down'){
        try {
            pizzas.revoteSuggestionOfTeam(suggestionName, teamname, mode);
            res.status(200).end(JSON.stringify({ msg: 'OK: Suggestion is revoted' }));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such suggestion for the team' }));
        }
    } else {
        res.status(400).end(JSON.stringify({ error: 'Bad request: mode value is not supported' }));
    }
});

api.get('/pizzas/:name/vote', (req, res, next) => {
    let teamname = req.query.teamname;
    let suggestionName = req.params.name;
    console.log(`[Log] GET /pizzas/${suggestionName}/vote/?teamname=${teamname}`);
    if (teamname === undefined || suggestionName === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or pizza name is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            res.status(200).end(JSON.stringify({ vote: pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, 'vote') }));
        } catch (error) {
            res.status(403).end(JSON.stringify({ error: 'Bad request: there is no such suggestion' }));
        }
    }
});

module.exports = api;
const express = require('express');
const api = express();
const teams = require('./team-api');

api.post('/pizzas', (req, res, next) => {
    let ingredients = req.body.ingredients;
    let teamname = req.body.teamname;
    if (ingredients === undefined || teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: ingredients or teamname is not defined' }));
    } else if (!teams.hasTeam(teamname)) {
        
    }
});

module.exports = api;
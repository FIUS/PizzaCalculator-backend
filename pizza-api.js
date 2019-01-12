const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();
const Pizzas = require('./pizzas');
const pizzas = new Pizzas();

function createPizza(ingredientsData) {
    let ingredientsNames = [];
    let vegetarian = true;
    let pork = false;
    ingredientsData.forEach((ingredient) => {
        if (!ingredient.vegetarian) { vegetarian = false }
        if (ingredient.pork) { pork = true};
        ingredientsNames.push(ingredient.name);
    });

    let pizza = {
        ingredient: ingredientsNames,
        vegetarian: vegetarian,
        pork: pork
    }
    return pizza;
}

api.post('/pizzas', (req, res, next) => {
    console.log('[Log] POST /pizzas');
    let ingredients = req.body.ingredients;
    let teamname = req.body.teamname;
    if (ingredients === undefined || teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: ingredients or teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let pizza = createPizza(ingredients);
        pizzas.addPizzaSuggestionForTeam(teamname, pizza);
        res.status(201).end(JSON.stringify(pizza));
    }
});

api.get('/pizzas', (req, res, next) => {
    console.log('[Log] GET /pizzas');
    let teamname = req.query.teamname;
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }))
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        res.status(200).end(JSON.stringify(pizzas.getPizzaSuggestionsOfTeam(teamname)));
    }
});

module.exports = api;
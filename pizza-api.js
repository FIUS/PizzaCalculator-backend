const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();
const Pizzas = require('./pizzas');
const pizzas = new Pizzas();


function createPizza(ingredientsData, teamname) {
    let ingredientsNames = [];
    let vegetarian = true;
    let pork = false;
    ingredientsData.forEach((ingredient) => {
        if (!ingredient.vegetarian) { vegetarian = false }
        if (ingredient.pork) { pork = true };
        ingredientsNames.push(ingredient.name);
    });
    let numberOfSuggestion = (pizzas.getPizzaSuggestionsOfTeam(teamname) != null) ? pizzas.getPizzaSuggestionsOfTeam(teamname).length : 0;
    let pizza = {
        name: numberOfSuggestion, // TODO make more beautiful than just a number
        ingredients: ingredientsNames,
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
        // Checks if all ingredients are existent
        pizzas.checkIngredientsOfPizza(ingredients, (result) => {
            if (result) {
                let pizza = createPizza(ingredients, teamname);
                try {
                    pizzas.addPizzaSuggestionForTeam(teamname, pizza);
                    res.status(201).end(JSON.stringify(pizza));
                } catch (error) {
                    res.status(400).end(JSON.stringify({ error: 'Bad request: The pizza suggestion already exists' }));
                }
            } else {
                res.status(400).end(JSON.stringify({ error: 'Bad request: At least one ingredient is not existent' }));
            }
        });
    }
});

api.post('/pizzas/templates', (req, res, next) => {
    let teamname = req.body.teamname;
    let template = req.body.template;
    if (teamname === undefined || template === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: template (pizza suggestion) or teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            pizzas.addPizzaSuggestionForTeam(teamname, template);
            res.status(201).end(JSON.stringify(template));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: The pizza suggestion already exists' }));
        }
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

/**
 * TODO Just a temporary mockup
 */
api.get('/pizzas/order', (req, res, next) => {
    let teamname = req.query.teamname;
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }))
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        res.status(200).end(JSON.stringify(pizzas.getPizzaSuggestionsOfTeam(teamname)));
    }
});

api.delete('/pizzas/:name', (req, res, next) => {
    let suggestionName = req.params.name;
    let teamname = req.body.teamname;
    if (teamname === undefined || suggestionName === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or name of pizza is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            let deletedSuggestion = pizzas.deletePizzaSuggestionOfTeam(suggestionName, teamname);
            res.status(200).end(JSON.stringify(deletedSuggestion));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: There is no such suggestion for the given team' }));
        }
    }
});

module.exports = api;
const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();

function createPizza(ingredientsData) {
    let ingredientsNames = [];
    let vegetarian = false;
    let pork = false;
    ingredientsData.forEach((ingredient) => {
        if (ingredient.vegetarian) { vegetarian = true }
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
    let ingredients = req.body.ingredients;
    let teamname = req.body.teamname;
    if (ingredients === undefined || teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: ingredients or teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        let pizza = createPizza(ingredients);
        res.status(201).end(JSON.stringify(pizza));
    }
});

module.exports = api;
const express = require('express');
const api = express();
const Teams = require('../controller/teams');
const teams = new Teams();
const Pizzas = require('../controller/pizzas');
const pizzas = new Pizzas();
const Solver = require('../controller/solver');
const solver = new Solver();

/**
 * List of property endpoints to autogenerate getter for all properties
 */
const propertyEndpoints = [
    { endpoint: 'registered-pieces', property: 'registeredPieces' },
    { endpoint: 'vegetarian', property: 'vegetarian' },
    { endpoint: 'pork', property: 'pork' },
];


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
        name: numberOfSuggestion.toString(), // TODO make more beautiful than just a number
        ingredients: ingredientsNames,
        vegetarian: vegetarian,
        pork: pork,
        vote: 0,
        registeredPieces: 0
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
                    pizzas.addPizzaSuggestionSession(teamname, pizza);
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
    console.log('[Log] POST /pizzas/templates');
    let teamname = req.body.teamname;
    let template = req.body.template;
    if (teamname === undefined || template === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: template (pizza suggestion) or teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            // Add vote to template suggestion
            template.vote = 0;
            pizzas.addPizzaSuggestionForTeam(teamname, template);
            pizzas.addPizzaSuggestionSession(teamname, template);
            res.status(201).end(JSON.stringify(template));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: The pizza suggestion already exists' }));
        }
    }
});

api.get('/pizzas', (req, res, next) => {
    let teamname = req.query.teamname;
    console.log(`[Log] GET /pizzas/?teamname=${teamname}`);
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        res.status(200).end(JSON.stringify(pizzas.getPizzaSuggestionsOfTeam(teamname)));
    }
});

api.patch('/pizzas/:name/registered-pieces', (req, res, next) => {
    let teamname = req.body.teamname;
    let registeredPieces = req.body.amount;
    let suggestionName = req.params.name;
    console.log(`[Log] GET /pizzas/${suggestionName}/registrered-pieces/?teamname=${teamname}`);
    if (teamname === undefined || suggestionName === undefined || registeredPieces === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname, registered pieces (amount) or pizza name is not defined' }));
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            pizzas.resetPropertyValueOfSuggestion(teamname, suggestionName, amount, 'registeredPieces'); // TODO implement
            res.status(200).end(JSON.stringify(pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, 'vote')));
        } catch (error) {
            res.status(403).end(JSON.stringify({ error: 'Bad request: there is no such suggestion' }));
        }
    }
});

api.get('/pizzas/order', (req, res, next) => {
    let teamname = req.query.teamname;
    console.log(`[Log] GET /pizzas/order/${teamname}`);
    if (teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname is not defined' }))
    } else if (!teams.has(teamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            res.status(200).end(
                JSON.stringify((teams.get(teamname).teamSize.type === 'persons') ? solver.solveForPersons(teamname) : solver.solveForPieces(teamname))
            );
        } catch (error) {
            res.status(409).end(JSON.stringify({ error: 'Conflict: not enough pizza parts to create a sufficent order' }));
        }
    }
});

api.delete('/pizzas/:name', (req, res, next) => {
    let suggestionName = req.params.name;
    let hashedTeamname = req.query.teamname;
    console.log(`[Log] DELETE /pizzas/${suggestionName}`);
    if (hashedTeamname === undefined || suggestionName === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or name of pizza is not defined' }));
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
    } else {
        try {
            let teamname = teams.getTeamnameOfHash(hashedTeamname);
            let deletedSuggestion = pizzas.deletePizzaSuggestionOfTeam(suggestionName, teamname);
            res.status(200).end(JSON.stringify(deletedSuggestion));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: There is no such suggestion for the given team' }));
        }
    }
});

propertyEndpoints.forEach((endpoint) => {
    api.get(`/pizzas/:name/${endpoint.endpoint}`, (req, res, next) => {
        let suggestionName = req.params.name;
        let teamname = req.query.teamname;
        console.log(`[Log] GET /pizza/${suggestionName}/${endpoint.endpoint}`);
        if (teamname === undefined || suggestionName === undefined) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or pizza name is not defined' }));
        } else if (!teams.has(teamname)) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
        } else {
            try {
                res.status(200).end(JSON.stringify({ [endpoint.property]: pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, endpoint.property) }));
            } catch (error) {
                res.status(403).end(JSON.stringify({ error: 'Not Found: there is no such suggestion' }));
            }
        }
    });
});

module.exports = api;
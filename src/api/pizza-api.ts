import express = require('express');
const api = express();
import Teams = require('../controller/teams');
const teams: Teams = new Teams();
const Pizzas = require('../controller/pizzas'); // TODO refactor after changing pizzas.js to typescript
const pizzas = new Pizzas();
import Solver = require('../controller/solver');
const solver: Solver = new Solver();

/**
 * List of property endpoints to autogenerate getter for all properties
 */
const propertyEndpoints: any[] = [
    { endpoint: 'registered-pieces', property: 'registeredPieces' },
    { endpoint: 'vegetarian', property: 'vegetarian' },
    { endpoint: 'pork', property: 'pork' },
];


function createPizza(ingredientsData: any[], teamname: string): any {
    let ingredientsNames: any[] = [];
    let vegetarian: boolean = true;
    let pork: boolean = false;
    ingredientsData.forEach((ingredient) => {
        if (!ingredient.vegetarian) { vegetarian = false }
        if (ingredient.pork) { pork = true };
        ingredientsNames.push(ingredient.name);
    });
    let numberOfSuggestion: number = (pizzas.getPizzaSuggestionsOfTeam(teamname) != null) ? pizzas.getPizzaSuggestionsOfTeam(teamname).length : 0;
    let pizza: any = {
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
    let ingredients: any = req.body.ingredients;
    let teamname: string = req.body.teamname;
    if (ingredients === undefined || teamname === undefined) {
        res.status(400).json({ message: 'Bad request: ingredients or teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        // Checks if all ingredients are existent
        pizzas.checkIngredientsOfPizza(ingredients, (result: any) => {
            if (result) {
                let pizza: any = createPizza(ingredients, teamname);
                try {
                    pizzas.addPizzaSuggestionForTeam(teamname, pizza);
                    pizzas.addPizzaSuggestionSession(teamname, pizza);
                    res.status(201).json(pizza);
                } catch (error) {
                    res.status(400).json({ message: 'Bad request: The pizza suggestion already exists' });
                }
            } else {
                res.status(400).json({ message: 'Bad request: At least one ingredient is not existent' });
            }
        });
    }
});

api.post('/pizzas/templates', (req, res, next) => {
    let teamname: string = req.body.teamname;
    let template: any = req.body.template;
    if (teamname === undefined || template === undefined) {
        res.status(400).json({ message: 'Bad request: template (pizza suggestion) or teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        try {
            // Add vote to template suggestion
            template.vote = 0;
            pizzas.addPizzaSuggestionForTeam(teamname, template);
            pizzas.addPizzaSuggestionSession(teamname, template);
            res.status(201).json(template);
        } catch (error) {
            res.status(400).json({ message: 'Bad request: The pizza suggestion already exists' });
        }
    }
});

api.get('/pizzas', (req, res, next) => {
    let teamname: string = req.query.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        res.status(200).json(pizzas.getPizzaSuggestionsOfTeam(teamname));
    }
});

api.patch('/pizzas/:name/registered-pieces', (req, res, next) => {
    let teamname: string = req.body.teamname;
    let registeredPieces: number = req.body.amount;
    let suggestionName: string = req.params.name;
    if (teamname === undefined || suggestionName === undefined || registeredPieces === undefined) {
        res.status(400).json({ message: 'Bad request: teamname, registered pieces (amount) or pizza name is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        try {
            pizzas.resetPropertyValueOfSuggestion(teamname, suggestionName, registeredPieces, 'registeredPieces');
            res.status(200).json(pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, 'vote'));
        } catch (error) {
            res.status(400).json({ message: 'Bad request: there is no such suggestion' });
        }
    }
});

api.get('/pizzas/order', (req, res, next) => {
    let teamname: string = req.query.teamname;
    if (teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname is not defined' });
    } else if (!teams.has(teamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        try {
            res.status(200).json( (teams.get(teamname).teamSize.type === 'persons') ? solver.solveForPersons(teamname) : solver.solveForPieces(teamname));
        } catch (error) {
            res.status(409).json( { message: 'Conflict: not enough pizza parts to create a sufficent order' });
        }
    }
});

api.delete('/pizzas/:name', (req, res, next) => {
    let suggestionName: string = req.params.name;
    let hashedTeamname: string = req.query.teamname;
    if (hashedTeamname === undefined || suggestionName === undefined) {
        res.status(400).json({ message: 'Bad request: teamname or name of pizza is not defined' });
    } else if (!teams.hasHash(hashedTeamname)) {
        res.status(400).json({ message: 'Bad request: there is no such team' });
    } else {
        try {
            let teamname: string = teams.getTeamnameOfHash(hashedTeamname);
            let deletedSuggestion: any = pizzas.deletePizzaSuggestionOfTeam(suggestionName, teamname);
            res.status(200).json(deletedSuggestion);
        } catch (error) {
            res.status(400).json({ message: 'Bad request: There is no such suggestion for the given team' });
        }
    }
});

propertyEndpoints.forEach((endpoint) => {
    api.get(`/pizzas/:name/${endpoint.endpoint}`, (req, res, next) => {
        let suggestionName: string = req.params.name;
        let teamname: string = req.query.teamname;
        if (teamname === undefined || suggestionName === undefined) {
            res.status(400).json({ message: 'Bad request: teamname or pizza name is not defined' });
        } else if (!teams.has(teamname)) {
            res.status(400).json({ message: 'Bad request: there is no such team' });
        } else {
            try {
                res.status(200).json({ [endpoint.property]: pizzas.getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, endpoint.property) });
            } catch (error) {
                res.status(400).json({ message: 'Bad request: Not Found: there is no such suggestion' });
            }
        }
    });
});

module.exports = api;
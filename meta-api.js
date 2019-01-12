const express = require('express');
const api = express();
const fs = require('fs');
const DBController = require('./db-controller');
const db = new DBController();

function changeIngredientsFlagsToBoolean(ingredients) {
    for (let i = 0; i < ingredients.length; ++i) {
        let vegetarian = ingredients[i].vegetarian;
        let pork = ingredients[i].pork;
        ingredients[i].vegetarian = (vegetarian === 1) ? true : false;
        ingredients[i].pork = (pork === 1) ? true : false;
    }
}

api.get('/ingredients', (req, res, next) => {
    console.log('[Log] GET /ingredients');
    try {
        db.getAllIngredients((ingredients) => {
            // If ingredients array is not null, return ingredients with 200
            if (ingredients != null) {
                changeIngredientsFlagsToBoolean(ingredients);
                res.status(200).end(JSON.stringify(ingredients));
            } else {
                console.log(ingredients);
                res.sendStatus(404);
            }
        });
    } catch (error) {
        console.error(`[Error] Catched error on retreiving all ingredients from DB in GET /ingredients: ${error}`);
        res.sendStatus(500);
    }
});

api.get('/templates', (req, res, next) => {
    console.log('[Log] GET /templates');
    try {
        let templates = fs.readFileSync('./templates.json');
        res.status(200).end(templates);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = api;
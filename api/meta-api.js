const express = require('express');
const api = express();
const DBController = require('../data/db-controller');
const db = new DBController();

function changeFlagsToBoolean(array) {
    for (let i = 0; i < array.length; ++i) {
        let vegetarian = array[i].vegetarian;
        let pork = array[i].pork;
        array[i].vegetarian = (vegetarian === 1) ? true : false;
        array[i].pork = (pork === 1) ? true : false;
    }
}

function parseTemplatesIngredients(templates) {
    for (let i = 0; i < templates.length; ++i) {
        templates[i].ingredients = JSON.parse(templates[i].ingredients);
    }
}

api.get('/ingredients', async (req, res, next) => {
    try {
        let ingredients = db.getAllIngredients();
        // If ingredients array is not null, return ingredients with 200
        if (ingredients != null) {
            changeFlagsToBoolean(ingredients);
            res.status(200).json(ingredients);
        } else {
            res.status(404).json({ err: 'Not Found: There are no ingredients available' });
        }
    } catch (error) {
        console.error(`[Error] Catched error on retrieving all ingredients from DB in GET /ingredients: ${error}`);
        res.status(500).json({ err: 'Internat Server Error' });
    }
});

api.get('/templates', (req, res, next) => {
    try {
        db.getAllTemplates((templates) => {
            // If templates array is not null, return templates with 200
            if (templates != null) {
                parseTemplatesIngredients(templates);
                changeFlagsToBoolean(templates);
                res.status(200).json(templates);
            } else {
                res.status(404).json({ err: 'Not Found: There are no ingredients available' });
            }
        });
    } catch (error) {
        res.status(500).json({ err: 'Internat Server Error' });
    }
});

module.exports = api;
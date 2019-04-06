const express = require('express');
const api = express();
const dbController = require('../data/db-controller');
const db = new dbController();

api.post('/templates', async (req, res, next) => {
    let name = req.body.name;
    let ingredients = req.body.ingredients;

    if (name === undefined || ingredients === undefined) {
        res.status(400).json({ message: "Bad request: At least one parameter is undefined" });
    } else {
        let existingIngredients = await db.getAllIngredients();
        for(let i = 0; i < ingredients.length; ++i) {
            let ingredientExists = (existingIngredients.find((ing) => {
                return ingredients[i] == ing.name;
            })) != undefined;

            if (!ingredientExists) {
                res.status(400).json({ message: "Bad request: One of the ingredients does not exist" });
                return;
            }
        }

        let vegetarian = true;
        let pork = false;
        for(let i = 0; i < ingredients.length; ++i) {
            let ingredient = await db.getIngredientByName(ingredients[i]);
            vegetarian = vegetarian && (Boolean) (ingredient.vegetarian);
            pork = pork || (Boolean) (ingredient.pork);
        }
        let template = {
            name: name,
            ingredients: ingredients,
            vegetarian: vegetarian,
            pork: pork
        };
        db.storeTemplate(template);
        res.status(201).json(template);
        db.addTemplateToFile(template);
    }
});

api.delete('/templates/:template', (req, res, next) => {
    let template = req.params.template;
    if (template === undefined) {
        res.status(400).json({ message: "Bad request: Template name is undefined"});
    } else {
        db.deleteTemplateByName(template).then(() => {
            res.status(202).json({ message: "Accepted: Template was deleted" });
            db.removeTemplateFromFile(template);
        }).catch(() => {
            res.status(400).json({ message: "Bad request: Template could not be deleted"});
        });
    }
});

api.post('/ingredients', (req, res, next) => {
    let name = req.body.name;
    let vegetarian = req.body.vegetarian;
    let pork = req.body.pork;
    if (name === undefined || vegetarian === undefined || pork === undefined) {
        res.status(400).json({ message: "Bad request: At least one parameter is undefined" });
    } else {
        let ingredient = {
            name: name,
            vegetarian: vegetarian,
            pork: pork
        }
        db.storeIngredient(ingredient);
        res.status(201).json(ingredient);
        db.addIngredientToFile(ingredient);
    }
});

api.delete('/ingredients/:name', (req, res, next) => {
    let name = req.params.name;
    if (name === undefined) {
        res.status(400).json({ message: "Bad request: Ingredient name is undefined" });
    } else {
        db.deleteIngredientByName(name).then(() => {
            res.status(202).json({ message: "Accepted: Ingredient was deleted" });
            db.removeIngredientFromFile(name);
        }).catch(() => {
            res.status(400).json({ message: "Bad request: Ingredient could not be deleted" });
        });
    }
});

module.exports = api;
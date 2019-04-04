const express = require('express');
const api = express();
const dbController = require('../data/db-controller');
const db = new dbController();

api.post('/templates', async (req, res, next) => {
    let name = req.body.name;
    let ingredients = req.body.ingredients;

    if (name === undefined || ingredients === undefined) {
        res.status(400).json({ message: "At least one parameter is undefined" });
    } else {
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

api.delete('/templates', (req, res, next) => {
    let template = req.body.template;
    if (template === undefined) {
        res.status(400).json({ message: "Template name is undefined"});
    } else {
        db.deleteTemplateByName(template).then(() => {
            res.status(202).json({ message: "Template was deleted" });
            db.removeTemplateFromFile(template);
        }).catch(() => {
            res.status(400).json({ message: "Template could not be deleted"});
        });
    }
});

module.exports = api;
import express = require('express');
const api = express();
const dbController = require('../data/db-controller'); // TODO change to import after refactoring db-controller to typescript
const db = new dbController();

api.post('/templates', async (req, res, next) => {
    let name: string = req.body.name;
    let ingredients: any[] = req.body.ingredients;

    if (name === undefined || ingredients === undefined) {
        res.status(400).json({ message: "Bad request: At least one parameter is undefined" });
    } else {
        let existingIngredients: string[] = await db.getAllIngredients();
        for(let i = 0; i < ingredients.length; ++i) {
            let ingredientExists: boolean = (existingIngredients.find((ing: any) => {
                return ingredients[i] == ing.name;
            })) != undefined;

            if (!ingredientExists) {
                res.status(400).json({ message: "Bad request: One of the ingredients does not exist" });
                return;
            }
        }

        let vegetarian: boolean = true;
        let pork: boolean = false;
        for(let i = 0; i < ingredients.length; ++i) {
            let ingredient: any = await db.getIngredientByName(ingredients[i]);
            vegetarian = vegetarian && (Boolean) (ingredient.vegetarian);
            pork = pork || (Boolean) (ingredient.pork);
        }
        let template: any = {
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
    let template: string = req.params.template;
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
    let name: string = req.body.name;
    let vegetarian: boolean = req.body.vegetarian;
    let pork: boolean = req.body.pork;
    if (name === undefined || vegetarian === undefined || pork === undefined) {
        res.status(400).json({ message: "Bad request: At least one parameter is undefined" });
    } else {
        let ingredient: any = {
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
    let name: string = req.params.name;
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

export = api;
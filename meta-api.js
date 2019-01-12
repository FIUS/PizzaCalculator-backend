const express = require('express');
const api = express();
const compression = require('compression');
const fs = require('fs');

api.get('/ingredients', (req, res, next) => {
    try {
        let ingredients = fs.readFileSync('./ingredients.json');
        console.log(JSON.parse(ingredients));
        res.status(200).end(ingredients);
    } catch (error) {
        res.sendStatus(500);
    }
});
api.get('/templates', (req, res, next) => {
    try {
        let templates = fs.readFileSync('./templates.json');
        console.log(JSON.parse(templates));
        res.status(200).end(templates);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = api;
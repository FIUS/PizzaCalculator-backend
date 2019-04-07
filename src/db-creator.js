const sqlite3 = require('sqlite3');
const DBController = require('./src/data/db-controller');
const fs = require('fs');

function recreateDB(callback) {
    let db = new sqlite3.Database('./src/data/meta.db');
    db.serialize(function () {
        // create DB tables
        db.run('DROP TABLE IF EXISTS Ingredients;');
        db.run('CREATE TABLE Ingredients (name VARCHAR(255) PRIMARY KEY, vegetarian BOOLEAN, pork BOOLEAN);');
        db.run('DROP TABLE IF EXISTS Templates;');
        db.run('CREATE TABLE Templates (name VARCHAR(255) PRIMARY KEY, ingredients TEXT, vegetarian BOOLEAN, pork BOOLEAN);');
    });
    db.close();

    console.log("The database was created at: ./src/data/meta.db");
    callback();
}

function initializeIngredients() {
    let db = new DBController();
    let ingredients = JSON.parse(fs.readFileSync('./src/data/ingredients.json'));
    ingredients.forEach((ingredient) => {
        db.storeIngredient(ingredient);
    });
}

function initializeTemplates() {
    let db = new DBController();
    let templates = JSON.parse(fs.readFileSync('./src/data/templates.json'));
    templates.forEach((template) => {
        db.storeTemplate(template);
    });
}

recreateDB(() => {
    setTimeout(() => {
        initializeIngredients();
        initializeTemplates();
        console.log('Initializing data');
    }, 1000);
    
});
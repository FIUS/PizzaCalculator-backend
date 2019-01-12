const sqlite3 = require('sqlite3');
const DBController = require('./db-controller');
const fs = require('fs');

function recreateDB() {
    let db = new sqlite3.Database('./meta.db');
    db.serialize(function () {
        // create DB tables
        db.run('DROP TABLE IF EXISTS Ingredients;');
        db.run('CREATE TABLE Ingredients (name VARCHAR(255) PRIMARY KEY, vegetarian BOOLEAN, pork BOOLEAN);');
        db.run('DROP TABLE IF EXISTS Templates;');
        db.run('CREATE TABLE Templates (name VARCHAR(255) PRIMARY KEY, ingredients TEXT, vegetarian BOOLEAN, pork BOOLEAN);');
    });
    db.close();

    console.log("The database was created at: ./meta.db");

    initializaIngredients();
}

function initializaIngredients() {
    let db = new DBController();
    let ingredients = JSON.parse(fs.readFileSync('./ingredients.json'));
    ingredients.forEach((ingredient) => {
        db.storeIngredient(ingredient);
    });
}

recreateDB();
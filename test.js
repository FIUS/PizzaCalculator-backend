const DBController = require('./db-controller');
const fs = require('fs');

let db = new DBController();
let ingredients = JSON.parse(fs.readFileSync('./ingredients.json'));
ingredients.forEach((ingredient) => {
    db.storeIngredient(ingredient);
});

// let j = new Test().foo();
// console.log(j);
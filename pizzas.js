const HashMap = require('hashmap');
const DBController = require('./db-controller');
const db = new DBController();

let suggestions = new HashMap();

/**
 * Checks if an given ingredientsArray contains an ingredient value
 * @param {*} given given array
 * @param {*} toCheck element to check
 * @returns true if toCheck is in given
 */
function contains(ingredients, toCheckIngredient) {
    let result = false;
    ingredients.forEach((element) => {
        if (element.name == toCheckIngredient.name) {
            result = true
            return;
        }
    });
    return result;
}

module.exports = class Pizzas {
    /**
     * Adds a pizza suggestion for a given team 
     * @param {*} teamname - Name of the team the suggestion is posted for
     * @param {*} suggestion - Pizza suggestion
     */
    addPizzaSuggestionForTeam(teamname, suggestion) {
        if (suggestions.has(teamname)) {
            suggestions.get(teamname).push(suggestion);
        } else {
            let pizzas = [];
            pizzas.push(suggestion);
            suggestions.set(teamname, pizzas);
        }
    };

    /**
     * Return a list of pizza suggestions for a given team
     * @param {*} teamname - Name of the team of which the suggestions belong
     */
    getPizzaSuggestionsOfTeam(teamname) {
        return suggestions.get(teamname);
    }

    /**
     * Checks if all ingredients of a given pizza existent.
     * @param {*} pizza - Given pizza to check
     * @param {*} callback - Callback with true if all ingredients are existent else false
     */
    checkIngredientsOfPizza(pizza, callback) {
        db.getAllIngredients((ingredients) => {
            let result = false;
            pizza.forEach((ingredient) => {
                result = result || contains(ingredients, ingredient);
            });
            callback(result);
        });
    }

    /**
     * Init 3 pizza suggestions for test team
     */
    setTestSuggestions() {
        let pizzas = [
            {
                name: 0,
                ingredients: [
                    "Tomaten",
                    "Mozarella",
                    "Feta"
                ],
                vegetarian: true,
                pork: false
            },
            {
                name: 1,
                ingredients: [
                    "Salami",
                    "Schinken",
                ],
                vegetarian: false,
                pork: true
            },
            {
                name: 2,
                ingredients: [
                    "Sucuk",
                    "Spinat",
                    "Feta",
                    "Pepperoni"
                ],
                vegetarian: false,
                pork: false
            }
        ];
        suggestions.set('test', pizzas);
    }

}
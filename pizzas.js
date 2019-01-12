const HashMap = require('hashmap');
const DBController = require('./db-controller');
const db = new DBController();

let suggestions = new HashMap();

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
            callback(ingredients.includes(pizza.ingredients));
        });
    }

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
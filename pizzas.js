const HashMap = require('hashmap');
const DBController = require('./db-controller');
const db = new DBController();

let suggestions = new HashMap();

/**
 * Creates a suggestion name for the hashmap.
 * Concatenates the ingredients names.
 * @param {*} suggestion - Given suggestion to create a name.
 */
function createSuggestionName(suggestion) {
    let suggestionName = '';
    suggestion.ingredients.forEach((ingredient) => {
        suggestionName += ingredient;
    });
    return suggestionName;
}

/**
 * Checks if an given ingredientsArray contains an ingredient value
 * @param {*} given given array
 * @param {*} toCheck element to check
 * @returns true if toCheck is in given
 */
function containsIngredient(ingredients, toCheckIngredient) {
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
            let teamSuggestions = suggestions.get(teamname);
            let suggestionName = createSuggestionName(suggestion);
            // Add if not already exists else throw new Error
            if (!teamSuggestions.has(suggestionName)) {
                suggestions.get(teamname).set(createSuggestionName(suggestion), suggestion);
            } else {
                throw new Error(`Pizza suggestion with name ${suggestionName} already exists`);
            }
        } else {
            let pizzas = new HashMap();
            pizzas.set(createSuggestionName(suggestion), suggestion);
            suggestions.set(teamname, pizzas);
        }
    };

    /**
     * Return a list of pizza suggestions for a given team
     * @param {*} teamname - Name of the team of which the suggestions belong
     */
    getPizzaSuggestionsOfTeam(teamname) {
        if (suggestions.has(teamname)) {
            return suggestions.get(teamname).values();
        } else {
            return null;
        }
    }

    /**
     * Deletes a teams pizza suggestion if it exists.
     * @param {*} suggestion - The name of the suggestions to delete
     * @param {*} teamname - The teamname which the suggestion should belong to
     * @throws Error if there is no such suggestion for the given team
     */
    deletePizzaSuggestionOfTeam(suggestionName, teamname) {
        let teamSuggestions = suggestions.get(teamname);
        let teamSuggestion;
        teamSuggestions.values().forEach((suggestion) => {
            if (suggestionName == suggestion.name) {
                teamSuggestion = suggestion;
            }
        });
        let hashMapSuggestionName = createSuggestionName(teamSuggestion);
        if (teamSuggestions.has(hashMapSuggestionName)) {
            teamSuggestions.remove(hashMapSuggestionName);
            return teamSuggestion;
        } else {
            throw new Error('There is no such suggestion for given team');
        }
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
                result = result || containsIngredient(ingredients, ingredient);
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
        let teamSuggestions = new HashMap();
        pizzas.forEach((pizza) => {
            pizza.vote = 0;
            teamSuggestions.set(createSuggestionName(pizza), pizza);
        });
        suggestions.set('test', teamSuggestions);
    }

}
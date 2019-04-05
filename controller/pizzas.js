const HashMap = require('hashmap');
const Set = require('set');
const DBController = require('../data/db-controller');
const db = new DBController();

/**
 * Map to store suggestions of a team
 * <key>: teamname
 * <value>: Map of suggestions
 *          <key>: Name of the suggestion
 *          <value>: Pizza object
 */
let suggestions = new HashMap();
/**
 * Map to store special suggestion names of a team
 * <key>: teamname
 * <value>: Set of suggestion names build as the concatenation of the ingredient names
 */
let suggestionNames = new HashMap();
/**
 * Map to store suggestions of a team for session handling
 * <key>: teamname
 * <value>: Map of suggestions
 *          <key>: Name of the suggestion
 *          <value>: Map of sessions
 *                  <key>: session id
 *                  <value>: amount
 */
let suggestionSessions = new HashMap();

/**
 * Creates a suggestion name for the set.
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
     * ############################
     * # Pizza suggestion methods #
     * ############################
     */

    addPizzaSuggestionSession(teamname, suggestion) {
        if (suggestionSessions.has(teamname)) {
            let suggestionSession = suggestionSessions.get(teamname);
            suggestionSession.set(suggestion.name, new HashMap());
        } else {
            let suggestionSession = new HashMap();
            suggestionSessions.set(teamname, suggestionSession);
        }
    }

    changeSessionPieces(teamname, pizza, session, pieces) {
        if (suggestionSessions.has(teamname) && suggestionSessions.get(teamname).has(pizza)) {
            suggestionSessions.get(teamname).get(pizza).set(session, pieces);
        } else if (suggestionSessions.has(teamname) && !suggestionSessions.get(teamname).has(pizza)) {
            let sessionMap = new HashMap();
            sessionMap.set(session, pieces);
            suggestionSessions.get(teamname).set(pizza, sessionMap);
        } else if (!suggestionSessions.has(teamname)) {
            let sessionMap = new HashMap();
            sessionMap.set(session, pieces);
            let pizzaMap = new HashMap();
            pizzaMap.set(pizza, sessionMap);
            suggestionSessions.set(teamname, pizzaMap);
        } else {
            throw new Error('team or pizza not in suggestionSessions');
        }
    }

    getSessionPieces(teamname, pizza, session) {
        if (suggestionSessions.has(teamname) && suggestionSessions.get(teamname).has(pizza)
            && suggestionSessions.get(teamname).get(pizza).has(session)) {
            return suggestionSessions.get(teamname).get(pizza).get(session);
        } else if (suggestionSessions.has(teamname) && !suggestionSessions.get(teamname).has(pizza)) {
            return 0;
        } else if (suggestionSessions.has(teamname) && suggestionSessions.get(teamname).has(pizza)
            && !suggestionSessions.get(teamname).get(pizza).has(session)) {
            return 0;
        } else {
            throw new Error('team or pizza not in suggestionSessions');
        }
    }

    getTotalPieces(teamname, pizza) {
        console.log(`Total Pieces: ${suggestionSessions.get(teamname).has(pizza)}`);
        if (suggestionSessions.has(teamname) && suggestionSessions.get(teamname).has(pizza)) {
            let sessions = suggestionSessions.get(teamname).get(pizza).values();
            let total = 0;
            sessions.forEach((pieces) => {
                total += new Number(pieces);
            });
            return total;
        } else if (suggestionSessions.has(teamname) && !suggestionSessions.get(teamname).has(pizza)) {
            return 0;
        } else {
            throw new Error('team or pizza not in suggestionSessions');
        }
    }


    /**
     * Adds a pizza suggestion for a given team 
     * @param {*} teamname - Name of the team the suggestion is posted for
     * @param {*} suggestion - Pizza suggestion
     */
    addPizzaSuggestionForTeam(teamname, suggestion) {
        if (suggestions.has(teamname)) {
            let teamSuggestions = suggestions.get(teamname);
            // Special suggestion name as concatenation of ingredients for suggestionNames
            let suggestionName = createSuggestionName(suggestion);
            // Add if not already exists else throw new Error
            if (!suggestionNames.get(teamname).contains(suggestionName)) {
                teamSuggestions.set(suggestion.name, suggestion);
                suggestionNames.get(teamname).add(suggestionName);
            } else {
                throw new Error(`Pizza suggestion with name ${suggestionName} or ${suggestion.name} already exists`);
            }
        } else {
            let pizzas = new HashMap();
            pizzas.set(suggestion.name, suggestion);
            suggestions.set(teamname, pizzas);
            let teamSuggestionNames = new Set();
            teamSuggestionNames.add(createSuggestionName(suggestion));
            suggestionNames.set(teamname, teamSuggestionNames);
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
        if (teamSuggestions.has(suggestionName)) {
            let teamSuggestion = teamSuggestions.get(suggestionName);
            teamSuggestions.remove(suggestionName);
            suggestionNames.get(teamname).remove(createSuggestionName(teamSuggestion));
            return teamSuggestion;
        } else {
            throw new Error('There is no such suggestion for given team');
        }
    }

    /**
    * ##################################
    * # Suggestion ingredients methods #
    * ##################################
    */

    /**
     * Checks if all ingredients of a given pizza existent.
     * @param {*} pizza - Given pizza to check
     * @param {*} callback - Callback with true if all ingredients are existent else false
     */
    async checkIngredientsOfPizza(pizza, callback) {
        let ingredients = await db.getAllIngredients();
        let result = false;
        pizza.forEach((ingredient) => {
            result = result || containsIngredient(ingredients, ingredient);
        });
        callback(result);
    }

    /**
    * ################
    * # Vote methods #
    * ################
    */

    /**
     * Up- or downvote a suggestion of a given team depending on the given mode
     * @param {*} suggestionName - Name of the suggestion which should be upvoted
     * @param {*} teamname - Name of the team
     * @param {*} mode - 'up' if the suggestion should be upvoted else 'down'
     * @throws Error if there is no suggestion with the given name
     */
    revoteSuggestionOfTeam(suggestionName, teamname, mode) {
        let teamSuggestions = suggestions.get(teamname);
        if (!teamSuggestions.has(suggestionName)) {
            throw new Error('There is no such suggestion');
        }
        (mode == 'up') ? teamSuggestions.get(suggestionName).vote++ : teamSuggestions.get(suggestionName).vote--;
    }

    getPropertyOfPizzaSuggestionOfTeam(teamname, suggestionName, property) {
        let teamSuggestion = suggestions.get(teamname);
        if (!teamSuggestion.has(suggestionName)) {
            throw new Error('There is no such suggestion');
        }
        return teamSuggestion.get(suggestionName)[property];
    }

    resetPropertyValueOfSuggestion(teamname, suggestionName, propertyValue, property) {
        let teamSuggestion = suggestions.get(teamname);
        if (!teamSuggestion.has(suggestionName)) {
            throw new Error('There is no such suggestion');
        }
        teamSuggestion.get(suggestionName)[property] = propertyValue;
    }

    /**
     * #################
     * # Setup methods #
     * #################
     */

    /**
     * Init 3 pizza suggestions for test team
     */
    setTestSuggestions() {
        let pizzas = [
            {
                name: '0',
                ingredients: [
                    "Tomaten",
                    "Mozarella",
                    "Feta"
                ],
                vegetarian: true,
                pork: false,
                registeredPieces: 0
            },
            {
                name: '1',
                ingredients: [
                    "Salami",
                    "Schinken",
                ],
                vegetarian: false,
                pork: true,
                registeredPieces: 0
            },
            {
                name: '2',
                ingredients: [
                    "Sucuk",
                    "Spinat",
                    "Feta",
                    "Pepperoni"
                ],
                vegetarian: false,
                pork: false,
                registeredPieces: 0
            }
        ];
        let teamSuggestions = new HashMap();
        let teamSuggestionNames = new Set();
        pizzas.forEach((pizza) => {
            pizza.vote = 0;
            teamSuggestions.set(pizza.name, pizza);
            teamSuggestionNames.add(createSuggestionName(pizza));
        });
        suggestions.set('test', teamSuggestions);
        suggestionNames.set('test', teamSuggestionNames);
        suggestions.set('SMHR', teamSuggestions);
        suggestionNames.set('SMHR', teamSuggestionNames);


        let pizzaMap = new HashMap();
        let sessionMap = new HashMap();
        sessionMap.set('1234567', 3);
        pizzaMap.set('0', sessionMap);
        suggestionSessions.set('test', pizzaMap);
    }

}
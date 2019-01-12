const HashMap = require('hashmap');
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

    setTestSuggestions() {
        let pizzas = [
            {
                ingredient: [
                    "Tomaten",
                    "Mozarella",
                    "Feta"
                ],
                vegetarian: true,
                pork: false
            },
            {
                ingredient: [
                    "Salami",
                    "Schinken",
                ],
                vegetarian: false,
                pork: true
            },
            {
                ingredient: [
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
const Teams = require('./teams');
const Pizzas = require('./pizzas');

const teams = new Teams();
const pizzas = new Pizzas();

function containsPizza(array, pizza) {
    for (let i = 0; i < array.length; ++i) {
        if (array[i].name === pizza.name) {
            return true;
        }
    }
    return false;
}

function countOfVegetarianPieces(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.vegetarian / 4) * 16;
    } else {
        return team.vegetarian;
    }
}

function countOfVegetarianPizzas(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.vegetarian / 4);
    } else {
        return Math.ceil(team.vegetarian / 16);
    }
}

function countOfNoPorkPieces(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.noPork / 4) * 16;
    } else {
        return team.noPork;
    }
}

function countOfNoPorkPizzas(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.noPork / 4);
    } else {
        return Math.ceil(team.noPork / 16);
    }
}

function getSuggestionsOfTeamOrdered(teamname) {
    let suggestions = pizzas.getPizzaSuggestionsOfTeam(teamname);
    suggestions.sort((a, b) => {
        return b.vote - a.vote;
    });
    return suggestions;
}

module.exports = class Solver {

    /**
     * Calculates an order using the votes, vegetarian and noPork properties of the suggestions
     * @param {*} teamname - The name of the team
     * @returns A array of suggestions which should be ordered
     */
    solveForPersons(teamname) {
        let numberOfVegetarianPizzasNeeded = countOfVegetarianPizzas(teamname);
        let numberOfVegetarianPizzasInOrder = 0;
        let numberOfNoPorkPizzasNeeded = countOfNoPorkPizzas(teamname);
        let numberOfNoPorkPizzasInOrder = 0;
        let numberOfPizzaPartsNeeded = teams.get(teamname).pizzaCount * 2;
        let suggestions = getSuggestionsOfTeamOrdered(teamname);
        let order = [];

        // First add enough vegetarian pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian and we need at least one more
            if (suggestions[i].vegetarian && numberOfVegetarianPizzasInOrder < numberOfVegetarianPizzasNeeded) {
                order.push(suggestions[i]);
            }
        }
        console.log(order);
        // Second add enough noPork pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian or has no pork and we need at least one more
            if ((suggestions[i].vegetarian || !suggestions[i].pork) && numberOfNoPorkPizzasNeeded < numberOfNoPorkPizzasInOrder) {
                // Only add if pizza is not already in order
                if (!containsPizza(order, suggestions[i])) {
                    order.push(suggestions[i]);
                }
            }
        }
        // At last fill with remaining pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            if (order.length < numberOfPizzaPartsNeeded && !containsPizza(order, suggestions[i])) {
                order.push(suggestions[i]);
            }
        }

        console.log(order);
    }
}
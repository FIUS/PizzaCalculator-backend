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
        return Math.ceil(team.vegetarian / 2) * 8;
    } else {
        return team.vegetarian;
    }
}

function countOfVegetarianPizzaParts(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.vegetarian / 2);
    } else {
        return Math.ceil(team.vegetarian / 8);
    }
}

function countOfNoPorkPieces(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return parseInt(Math.ceil(team.noPork / 2) * 8);
    } else {
        return parseInt(team.noPork);
    }
}

function countOfNoPorkPizzaParts(teamname) {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.noPork / 2);
    } else {
        return Math.ceil(team.noPork / 8);
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
     * Calculates an order using the votes, vegetarian and noPork properties of the suggestions regarding pieces mode
     * @param {*} teamname - The name of the team
     * @returns A array of suggestions which should be ordered
     */
    solveForPieces(teamname) {
        let numberOfVegetarianPizzaPiecesNeeded = countOfVegetarianPieces(teamname);
        let numberOfVegetarianPizzaPiecesinOrder = 0;
        let numberOfNoPorkPizzaPiecesNeeded = countOfNoPorkPieces(teamname);
        let numberOfNoPorkPizzaPiecesInOrder = 0;
        let numberOfPizzaPartsNeeded = teams.get(teamname).pizzaCount;
        let numberOfPizzaPiecesNeeded = numberOfPizzaPartsNeeded * 8;
        let suggestions = getSuggestionsOfTeamOrdered(teamname);
        let order = [];

        // First add enough vegetarian pizza pieces
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian and we need at least one more
            if (suggestions[i].vegetarian && numberOfVegetarianPizzaPiecesinOrder < numberOfVegetarianPizzaPiecesNeeded) {
                order.push(suggestions[i]);
                numberOfVegetarianPizzaPiecesinOrder += 8;
            }
        }

        // Check if enough vegetarian pizzas are in the order, else throw Error
        if (numberOfVegetarianPizzaPiecesNeeded > numberOfVegetarianPizzaPiecesinOrder) {
            throw new Error('There are not enough vegetarian pizzas');
        }

        // Add noPork pizza pieces regarding remaining vegetarian pizza pieces
        let noPorkVegetarianPizzaPieces = numberOfVegetarianPizzaPiecesinOrder - numberOfVegetarianPizzaPiecesNeeded;
        numberOfNoPorkPizzaPiecesInOrder += noPorkVegetarianPizzaPieces;
        // Second add enough noPork pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian or has no pork and we need at least one more
            if ((suggestions[i].vegetarian || !suggestions[i].pork) && numberOfNoPorkPizzaPiecesInOrder < numberOfNoPorkPizzaPiecesNeeded) {
                // Only add if pizza is not already in order
                if (!containsPizza(order, suggestions[i])) {
                    order.push(suggestions[i]);
                    numberOfNoPorkPizzaPiecesInOrder += 8;
                }
            }
        }

        // Check if enough no pork pizzas are in the order, else throw Error
        if (numberOfNoPorkPizzaPiecesNeeded > numberOfNoPorkPizzaPiecesInOrder) {
            throw new Error('There are not enough no pork pizzas');
        }
        // At last fill with remaining pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            if (order.length * 8 < numberOfPizzaPiecesNeeded && !containsPizza(order, suggestions[i])) {
                order.push(suggestions[i]);
            }
        }

        // Check if enough vegetarian pizzas are in the order, else throw Error
        if (numberOfPizzaPiecesNeeded > order.length * 8) {
            throw new Error('There are not enough pizzas');
        }
        return order;

    }

    /**
     * Calculates an order using the votes, vegetarian and noPork properties of the suggestions regarding persons mode
     * @param {*} teamname - The name of the team
     * @returns A array of suggestions which should be ordered
     */
    solveForPersons(teamname) {
        let numberOfVegetarianPizzaPartsNeeded = countOfVegetarianPizzaParts(teamname);
        let numberOfVegetarianPizzaPartsInOrder = 0;
        let numberOfNoPorkPizzaPartsNeeded = countOfNoPorkPizzaParts(teamname);
        let numberOfNoPorkPizzaPartsInOrder = 0;
        let numberOfPizzaPartsNeeded = teams.get(teamname).pizzaCount;
        let suggestions = getSuggestionsOfTeamOrdered(teamname);
        let order = [];


        // First add enough vegetarian pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian and we need at least one more
            if (suggestions[i].vegetarian && numberOfVegetarianPizzaPartsInOrder < numberOfVegetarianPizzaPartsNeeded) {
                order.push(suggestions[i]);
                numberOfVegetarianPizzaPartsInOrder++;
            }
        }

        // Check if enough vegetarian pizzas are in the order, else throw Error
        if (numberOfVegetarianPizzaPartsNeeded > numberOfVegetarianPizzaPartsInOrder) {
            throw new Error('There are not enough vegetarian pizzas');
        }

        // Second add enough noPork pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            // Pizza is vegetarian or has no pork and we need at least one more
            if ((suggestions[i].vegetarian || !suggestions[i].pork) && numberOfNoPorkPizzaPartsNeeded > numberOfNoPorkPizzaPartsInOrder) {
                // Only add if pizza is not already in order
                if (!containsPizza(order, suggestions[i])) {
                    order.push(suggestions[i]);
                    numberOfNoPorkPizzaPartsInOrder++;
                }
            }
        }

        // Check if enough no pork pizzas are in the order, else throw Error
        if (numberOfNoPorkPizzaPartsNeeded > numberOfNoPorkPizzaPartsInOrder) {
            throw new Error('There are not enough no pork pizzas');
        }

        // At last fill with remaining pizzas
        for (let i = 0; i < suggestions.length; ++i) {
            if (order.length < numberOfPizzaPartsNeeded && !containsPizza(order, suggestions[i])) {
                order.push(suggestions[i]);
            }
        }

        // Check if enough vegetarian pizzas are in the order, else throw Error
        if (numberOfPizzaPartsNeeded > order.length) {
            throw new Error('There are not enough pizzas');
        }
        return order;
    }
}
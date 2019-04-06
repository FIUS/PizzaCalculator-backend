import Teams = require('./teams');
const Pizzas = require('./pizzas'); // TODO after refactor pizzas.js to typescript

const teams: Teams = new Teams();
const pizzas = new Pizzas();

function containsPizza(array: any, pizza: any): boolean {
    for (let i = 0; i < array.length; ++i) {
        if (array[i].name === pizza.name) {
            return true;
        }
    }
    return false;
}

function countOfVegetarianPieces(teamname: string): number {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.vegetarian / 2) * 8;
    } else {
        return team.vegetarian;
    }
}

function countOfVegetarianPizzaParts(teamname: string): number {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.vegetarian / 2);
    } else {
        return Math.ceil(team.vegetarian / 8);
    }
}

function countOfNoPorkPieces(teamname: string): number {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.noPork / 2) * 8;
    } else {
        return team.noPork;
    }
}

function countOfNoPorkPizzaParts(teamname: string): number {
    let team = teams.get(teamname);
    if (team.teamSize.type === 'persons') {
        return Math.ceil(team.noPork / 2);
    } else {
        return Math.ceil(team.noPork / 8);
    }
}

function getSuggestionsOfTeamOrdered(teamname: string): any[] {
    let suggestions = pizzas.getPizzaSuggestionsOfTeam(teamname);
    suggestions.sort((a: any, b: any) => {
        return b.vote - a.vote;
    });
    return suggestions;
}

class Solver {
    /**
     * Calculates an order using the votes, vegetarian and noPork properties of the suggestions regarding pieces mode
     * @param {*} teamname - The name of the team
     * @returns A array of suggestions which should be ordered
     */
    solveForPieces(teamname: string): any[] {
        let numberOfVegetarianPizzaPiecesNeeded: number = countOfVegetarianPieces(teamname);
        let numberOfVegetarianPizzaPiecesinOrder: number = 0;
        let numberOfNoPorkPizzaPiecesNeeded: number = countOfNoPorkPieces(teamname);
        let numberOfNoPorkPizzaPiecesInOrder: number = 0;
        let numberOfPizzaPartsNeeded: number = teams.get(teamname).pizzaCount;
        let numberOfPizzaPiecesNeeded: number = numberOfPizzaPartsNeeded * 8;
        let suggestions: any[] = getSuggestionsOfTeamOrdered(teamname);
        let order: any[] = [];

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
    solveForPersons(teamname: string): any[] {
        let numberOfVegetarianPizzaPartsNeeded: number = countOfVegetarianPizzaParts(teamname);
        let numberOfVegetarianPizzaPartsInOrder: number = 0;
        let numberOfNoPorkPizzaPartsNeeded: number = countOfNoPorkPizzaParts(teamname);
        let numberOfNoPorkPizzaPartsInOrder: number = 0;
        let numberOfPizzaPartsNeeded: number = teams.get(teamname).pizzaCount;
        let suggestions: any[] = getSuggestionsOfTeamOrdered(teamname);
        let order: any[] = [];


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

export = Solver;
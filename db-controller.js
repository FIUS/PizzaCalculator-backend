const sqlite3 = require('sqlite3').verbose();
const HashMap = require('hashmap');

let preparedStatements = new HashMap();
let db = new sqlite3.Database('./meta.db');

/**
 * Function for sql prepared statements
 * @param {*} statement 
 * @param {*} next 
 */
function prepare(statement, next) {
    if (preparedStatements.has(statement)) {
        try {
            const sql = preparedStatements.get(statement);
            sql.reset(); // provoke error if statement is finalized
            return sql;
        } catch (error) { } // don't use finalized statements
    }
    var stmt = db.prepare(statement, function (err) {
        if (err) {
            console.log('[DB] [FAIL] Error Preparing Statement "' + statement + '" \n' +
                'Error Text: ' + err.message);
            if (next) {
                err = new Error('Error while preparing statement! \n' +
                    'Statement: "' + statement + '"\n' +
                    'Error: ' + err.message);
                return next(err);
            }
        }
    });
    preparedStatements.set(statement, stmt);
    return stmt;
}

module.exports = class DBController {

    storeIngredient(ingredient) {
        let stmt = prepare('INSERT INTO Ingredients(name, vegetarian, pork) VALUES (?, ?, ?);');
        let name = ingredient.name;
        let vegetarian = ingredient.vegetarian;
        let pork = ingredient.pork;
        try {
            stmt.run(name, vegetarian, pork, (err) => {
                if (err) {
                    console.log(`[Error] Error on inserting new ingredient: ${err}`);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    getAllIngredients(callback) {
        let stmt = prepare('SELECT name, vegetarian, pork FROM Ingredients;');
        stmt.all((err, result) => {
            if (err) {
                console.log('[Error] Error on receiving ingredients');
                callback(null);
            }
            callback(result);
        });
    }
}
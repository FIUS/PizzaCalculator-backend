const sqlite3 = require('sqlite3').verbose();
import HashMap = require('hashmap');
const fs = require('fs');

let preparedStatements: HashMap<string, any> = new HashMap();
let db = new sqlite3.Database('./src/data/meta.db');

/**
 * Function for sql prepared statements
 * @param {*} statement 
 * @param {*} next 
 */
function prepare(statement: string): any {
    if (preparedStatements.has(statement)) {
        try {
            const sql: any = preparedStatements.get(statement);
            sql.reset(); // provoke error if statement is finalized
            return sql;
        } catch (error) { } // don't use finalized statements
    }
    var stmt = db.prepare(statement, function (err: any) {
        if (err) {
            console.log('[DB] [FAIL] Error Preparing Statement "' + statement + '" \n' +
                'Error Text: ' + err.message);
        }
    });
    preparedStatements.set(statement, stmt);
    return stmt;
}

class DBController {

    storeIngredient(ingredient: any) {
        let stmt = prepare('INSERT OR REPLACE INTO Ingredients(name, vegetarian, pork) VALUES (?, ?, ?);');
        let name: string = ingredient.name;
        let vegetarian: boolean = ingredient.vegetarian;
        let pork: boolean = ingredient.pork;
        try {
            stmt.run(name, vegetarian, pork, (err: any) => {
                if (err) {
                    console.log(`[Error] Error on inserting new ingredient: ${err}`);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    getAllIngredients() {
        let stmt = prepare('SELECT name, vegetarian, pork FROM Ingredients ORDER BY name ASC;');
        return new Promise((resolve, reject) => {
            stmt.all((err: any, result: any[]) => {
                if (err) {
                    console.log(`[Error] Error on receiving ingredients: ${err}`);
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    getIngredientByName(name: string) {
        let stmt = prepare('SELECT name, vegetarian, pork FROM Ingredients WHERE name = ?;');
        return new Promise((resolve, reject) => {
            stmt.get(name, (err: any, result: any) => {
                if (err) {
                    console.log(`[Error] Error on receiving ingredients: ${err}`);
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    storeTemplate(template: any) {
        let stmt = prepare('INSERT OR REPLACE INTO Templates(name, ingredients, vegetarian, pork) VALUES (?, ?, ?, ?);');
        let name: string = template.name;
        let ingredients: string = JSON.stringify(template.ingredients);
        let vegetarian: boolean = template.vegetarian;
        let pork: boolean = template.pork;
        try {
            stmt.run(name, ingredients, vegetarian, pork, (err: any) => {
                if (err) {
                    console.log(`[Error] Error on inserting new template: ${err}`);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    // TODO refactor with promises
    getAllTemplates(callback: any) {
        let stmt = prepare('SELECT name, ingredients, vegetarian, pork FROM Templates ORDER BY name ASC;');
        stmt.all((err: any, result: any) => {
            if (err) {
                console.log(`[Error] Error on receiving templates: ${err}`);
                callback(null);
            }
            callback(result);
        });
    }


    deleteTemplateByName(name: string) {
        let stmt = prepare('DELETE FROM Templates WHERE name = ?;');
        return new Promise((resolve, reject) => {
            stmt.run(name, (err: any) => {
                if (err) {
                    console.log('[Error] Error on deleting template');
                    reject(err);
                    return;
                } else {
                    resolve();
                }
            });
        });
    }

    deleteIngredientByName(name: string) {
        let stmt = prepare('DELETE FROM Ingredients WHERE name = ?;');
        return new Promise((resolve, reject) => {
            stmt.run(name, (err: any) => {
                if (err) {
                    console.log('[Error] Error on deleting ingredient');
                    reject(err);
                    return;
                } else {
                    resolve();
                }
            });
        });
    }


    addTemplateToFile(template: any) {
        let templates = JSON.parse(fs.readFileSync('./src/data/templates.json'));
        templates.push(template);
        try {
            fs.writeFile('./src/data/templates.json', JSON.stringify(templates), (err: any) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    addIngredientToFile(ingredient: any) {
        let ingredients = JSON.parse(fs.readFileSync('./src/data/ingredients.json'));
        ingredients.push(ingredient);
        try {
            fs.writeFile('./src/data/ingredients.json', JSON.stringify(ingredients), (err: any) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    removeTemplateFromFile(templateName: string) {
        let templates = JSON.parse(fs.readFileSync('./src/data/templates.json'));
        try {
            fs.writeFile('./src/data/templates.json', JSON.stringify(templates.filter((t: any) => {
                return t.name != templateName;
            })), (err: any) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }

    removeIngredientFromFile(ingredientName: string) {
        let ingredients = JSON.parse(fs.readFileSync('./src/data/ingredients.json'));
        try {
            fs.writeFile('./src/data/ingredients.json', JSON.stringify(ingredients.filter((i: any) => {
                return i.name != ingredientName;
            })), (err: any) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        } catch (error) {
            // TODO some error handling
        }
    }
}

export = DBController;
const express = require('express');
const api = express();
const compression = require('compression');
/**
 * APIs for ingredients and templates
 */
const metaAPI = require('./api/meta-api');
/**
 * APIs for teams
 */
const teamAPI = require('./api/team-api');
/**
 * APIs for pizzas
 */
const pizzaAPI = require('./api/pizza-api');
/**
 * APIs for votes of pizzas
 */
const votesAPI = require('./api/votes-api');
/**
 * APIs for the admin page
 */
const adminAPI = require('./api/admin-api');
/**
 * APIs for the session page
 */
const sessionAPI = require('./api/session-api');
/**
 * Module to control teams
 */
const Teams = require('./controller/teams');
const teams = new Teams();
/**
 * Module to control pizzas
 */
const Pizzas = require('./controller/pizzas');
const pizzas = new Pizzas();
/**
 * Module to control sessions
 */
const Sessions = require('./controller/sessions');
const sessions = new Sessions();

/**
 * Start server on 8080 or PORT of environment varibale
 */
let port = 8080

if (process.env.PORT != null) {
    let envPort = parseInt(process.env.PORT);
    if (!(isNaN(envPort) || envPort < 1 || envPort > 65535)) {
        console.log("Found valid environment variable PORT. Setting port to %i", envPort);
        port = envPort;
    } else {
        console.log("The value \"%s\" is not a valid port. Falling back to 8080.", process.env.PORT);
    }
} else {
    console.log("Environment variable PORT not set. Using default port 8080.");
}

// Setup Global Middlewares
api.use(compression());
api.use(express.json());
api.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);
    // Set response header to application/json
    res.setHeader('content-type', 'application/json');

    // Pass to next layer of middleware
    next();
});
api.use('/', metaAPI);
api.use('/', teamAPI);
api.use('/', pizzaAPI);
api.use('/', votesAPI);
api.use('/', adminAPI);
api.use('/', sessionAPI);

var server = api.listen(port, function () {
    teams.setTestTeams();
    pizzas.setTestSuggestions();
    sessions.setupSessions();

    var host = server.address().address;
    var port = server.address().port;
    console.log("REST server listening at http://%s:%s", host, port);
});


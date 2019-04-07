import express = require('express');
const api = express();
import compression = require('compression');
/**
 * APIs for ingredients and templates
 */
import metaAPI = require('./api/meta-api');
/**
 * APIs for teams
 */
const teamAPI = require('./api/team-api');
/**
 * APIs for pizzas
 */
import pizzaAPI = require('./api/pizza-api');
/**
 * APIs for votes of pizzas
 */
import votesAPI = require('./api/votes-api');
/**
 * APIs for the admin page
 */
import adminAPI = require('./api/admin-api');
/**
 * APIs for the session page
 */
const sessionAPI = require('./api/session-api');
/**
 * APIs for global configuration admin page to configure server
 */
import configurationAPI = require('./api/configuration-api');
/**
 * Module to control teams
 */
import Teams = require('./controller/teams');
const teams: Teams = new Teams();
/**
 * Module to control pizzas
 */
import Pizzas = require('./controller/pizzas');
const pizzas: Pizzas = new Pizzas();
/**
 * Module to control sessions
 */
import Sessions = require('./controller/sessions');
const sessions: Sessions = new Sessions();

/**
 * Start server on 8080 or PORT of environment varibale
 */
let port: number = 8080

if (process.env.PORT != null) {
    let envPort: number = parseInt(process.env.PORT);
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
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    // Set response header to application/json
    res.setHeader('content-type', 'application/json');

    // Pass to next layer of middleware
    next();
});
api.use('/', (req, res, next) => {
    // Log every incoming request and its http method
    console.log(`[Log] ${req.method} ${req.originalUrl}`);
    next();
});
api.use('/', metaAPI);
api.use('/', teamAPI);
api.use('/', pizzaAPI);
api.use('/', votesAPI);
api.use('/', adminAPI);
api.use('/', sessionAPI);
api.use('/', configurationAPI);

let server: any = api.listen(port, function () {
    teams.setTestTeams();
    pizzas.setTestSuggestions();
    sessions.setupSessions();

    let host: string = server.address().address;
    let port: number = server.address().port;
    console.log("REST server listening at http://%s:%s", host, port);
});


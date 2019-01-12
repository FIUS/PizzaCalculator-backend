const express = require('express');
const api = express();
const compression = require('compression');
const fs = require('fs');

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

var server = api.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("REST server listening at http://%s:%s", host, port);
});

// Setup Global Middlewares
api.use(compression());
api.use(express.json());
api.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
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

api.get('/ingredients', (req, res, next) => {
    try {
        let ingredients = fs.readFileSync('./ingredients.json');
        console.log(JSON.parse(ingredients));
        res.status(200).end(ingredients);   
    } catch (error) {
        res.sendStatus(500);
    }
});

api.get('/templates', (req, res, next) => {
    try {
        let templates = fs.readFileSync('./templates.json');
        console.log(JSON.parse(templates));
        res.status(200).end(templates);
    } catch (error) {
        res.sendStatus(500);
    }
});

api.post('/pizzas', (req, res, next) => {
    res.sendStatus(404);
});
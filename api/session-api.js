const express = require('express');
const api = express();
const uuid = require('uuid/v4');
const Sessions = require('../controller/sessions');
const sessions = new Sessions();
const Teams = require('../controller/teams');
const teams = new Teams();
const Pizzas = require('../controller/pizzas');
const pizzas = new Pizzas();

api.post('/uuid', (req, res, next) => {
    console.log('[Log] POST /uuid');
    let sessionID = uuid();
    sessions.set(sessionID, sessionID);
    console.log(`SessionID: ${sessions.get(sessionID)}`);
    res.status(201).end(JSON.stringify({ uuid: sessionID }));
});

api.post('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.body.teamname;
    let session = req.body.uuid;
    let pieces = req.body.pieces;

    console.log(`[Log] POST /pizzas/${pizzaName}/pieces`);
    if (session === undefined || pizzaName === undefined || teamname === undefined || pieces === undefined || pieces < 0) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname, session, pizza name or pieces is not defined' }));
    } else if (!sessions.has(session)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such session' }));
    } else {
        try {
            pizzas.changeSessionPieces(teamname, pizzaName, session, pieces);
            res.status(200).end(JSON.stringify({ msg: 'OK' }));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: Problems changing session pieces' }));
        }
    }
});

api.get('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;
    let session = req.query.uuid;

    if (session === undefined || pizzaName === undefined || teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname, session or pizza name is not defined' }));
    } else if (!sessions.has(session)) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such session' }));
    } else {
        try {
            let pieces = pizzas.getSessionPieces(teamname, pizzaName, session);
            res.status(200).end(JSON.stringify({ pieces: pieces }));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: Problems getting session pieces' }));
        }
    }
});

api.get('/pizzas/:name/pieces/total', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;

    console.log(`[Log] GET /pizzas/${pizzaName}/pieces/total`);
    if (pizzaName === undefined || teamname === undefined) {
        res.status(400).end(JSON.stringify({ error: 'Bad request: teamname or pizza name is not defined' }));
    } else {
        try {
            let total = pizzas.getTotalPieces(teamname, pizzaName);
            res.status(200).end(JSON.stringify({ total: total }));
        } catch (error) {
            res.status(400).end(JSON.stringify({ error: 'Bad request: Problems getting total pieces' }));
        }
    }
});


module.exports = api;
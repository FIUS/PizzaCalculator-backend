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
    let sessionID = uuid();
    sessions.set(sessionID, sessionID);
    res.json(201, { uuid: sessionID });
});

api.post('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.body.teamname;
    let session = req.body.uuid;
    let pieces = req.body.pieces;

    if (session === undefined || pizzaName === undefined || teamname === undefined || pieces === undefined || pieces < 0) {
        res.json(400, { error: 'Bad request: teamname, session, pizza name or pieces is not defined' });
    } else if (!sessions.has(session)) {
        res.json(400, { error: 'Bad request: there is no such session' });
    } else {
        try {
            pizzas.changeSessionPieces(teamname, pizzaName, session, pieces);
            res.json(200, { msg: 'OK' });
        } catch (error) {
            res.json(400, { error: 'Bad request: Problems changing session pieces' });
        }
    }
});

api.get('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;
    let session = req.query.uuid;

    if (session === undefined || pizzaName === undefined || teamname === undefined) {
        res.json(400, { error: 'Bad request: teamname, session or pizza name is not defined' });
    } else if (!sessions.has(session)) {
        res.json(400, { error: 'Bad request: there is no such session' });
    } else {
        try {
            let pieces = pizzas.getSessionPieces(teamname, pizzaName, session);
            res.json(200, { pieces: pieces });
        } catch (error) {
            res.json(400, { error: 'Bad request: Problems getting session pieces' });
        }
    }
});

api.get('/pizzas/:name/pieces/total', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;

    if (pizzaName === undefined || teamname === undefined) {
        res.json(400, { error: 'Bad request: teamname or pizza name is not defined' });
    } else {
        try {
            let total = pizzas.getTotalPieces(teamname, pizzaName);
            res.json(200, { total: total });
        } catch (error) {
            res.json(400, { error: 'Bad request: Problems getting total pieces' });
        }
    }
});


module.exports = api;
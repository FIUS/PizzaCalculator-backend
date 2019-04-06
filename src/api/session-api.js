const express = require('express');
const api = express();
const uuid = require('uuid/v4');
const Sessions = require('../controller/sessions');
const sessions = new Sessions();
const Pizzas = require('../controller/pizzas');
const pizzas = new Pizzas();

api.post('/uuid', (req, res, next) => {
    let sessionID = uuid();
    sessions.set(sessionID, sessionID);
    res.status(201).json({ uuid: sessionID });
});

api.post('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.body.teamname;
    let session = req.body.uuid;
    let pieces = req.body.pieces;

    if (session === undefined || pizzaName === undefined || teamname === undefined || pieces === undefined || pieces < 0) {
        res.status(400).json({ message: 'Bad request: teamname, session, pizza name or pieces is not defined' });
    } else if (!sessions.has(session)) {
        res.status(400).json({ message: 'Bad request: there is no such session' });
    } else {
        try {
            pizzas.changeSessionPieces(teamname, pizzaName, session, pieces);
            res.status(200).json({ message: 'OK' });
        } catch (error) {
            res.status(400).json({ message: 'Bad request: Problems changing session pieces' });
        }
    }
});

api.get('/pizzas/:name/pieces', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;
    let session = req.query.uuid;

    if (session === undefined || pizzaName === undefined || teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname, session or pizza name is not defined' });
    } else if (!sessions.has(session)) {
        res.status(400).json({ message: 'Bad request: there is no such session' });
    } else {
        try {
            let pieces = pizzas.getSessionPieces(teamname, pizzaName, session);
            res.status(200).json({ pieces: pieces });
        } catch (error) {
            res.status(400).json({ message: 'Bad request: Problems getting session pieces' });
        }
    }
});

api.get('/pizzas/:name/pieces/total', (req, res, next) => {
    let pizzaName = req.params.name;
    let teamname = req.query.teamname;

    if (pizzaName === undefined || teamname === undefined) {
        res.status(400).json({ message: 'Bad request: teamname or pizza name is not defined' });
    } else {
        try {
            let total = pizzas.getTotalPieces(teamname, pizzaName);
            res.status(200).json({ total: total });
        } catch (error) {
            res.status(400).json({ message: 'Bad request: Problems getting total pieces' });
        }
    }
});


module.exports = api;
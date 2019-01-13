const express = require('express');
const api = express();
const uuid = require('uuid/v4');
const Sessions = require('./sessions');
const sessions = new Sessions();
const Teams = require('./teams');
const teams = new Teams();
const Pizzas = require('./pizzas');
const pizzas = new Pizzas();

api.post('/uuid', (req, res, next) => {
    let sessionID = uuid();
    sessions.set(sessionID, sessionID);
    res.status(201).end(JSON.stringify({ uuid: sessionID }));
});

// api.patch('/pizzas/:name/pieces', (req, res, next) => {
//     let pizzaName = req.params.name;
//     let teamname = req.body.teamname;
//     let session = req.body.uuid;
//     let pieces = req.body.pieces;

//     if (session === undefined || pizzaName === undefined || teamname === undefined || pieces === undefined) {
//         res.status(400).end(JSON.stringify({ error: 'Bad request: teamname, session, pizza name or pieces is not defined' }));
//     } else if (!sessions.has(session)) {
//         res.status(400).end(JSON.stringify({ error: 'Bad request: there is no such team' }));
//     }
// });


module.exports = api;
const express = require('express');
const api = express();
const uuid = require('uuid/v4');
const Sessions = require('./sessions');
const sessions = new Sessions();

api.post('/uuid', (req, res, next) => {
    let sessionID = uuid();
    sessions.set(sessionID, sessionID);
    res.status(201).end(JSON.stringify({ uuid: sessionID }));
});


module.exports = api;
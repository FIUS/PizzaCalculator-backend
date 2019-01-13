const express = require('express');
const api = express();
const Teams = require('./teams');
const teams = new Teams();



module.exports = api;
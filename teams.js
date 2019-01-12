const HashMap = require('hashmap');
const crypto = require('crypto');
let teams = new HashMap();
let hashedTeamnames = new HashMap();

module.exports = class Teams {
    has(team) {
        return teams.has(team);
    }

    hasHash(team) {
        return hashedTeamnames.has(team);
    }

    set(teamname, data) {
        teams.set(teamname, data);
    }

    setHash(teamname, data) {
        hashedTeamnames.set(teamname, data);
    }

    keys() {
        return teams.keys();
    }

    hashKeys() {
        return hashedTeamnames.keys();
    }

    getTeamnameOfHash(hashedName) {
        if (hashedTeamnames.has(hashedName)) {
            return hashedTeamnames.get(hashedName);
        }
        throw new Error('No such team in hashedTeamnames');
    }

    setTestTeams() {
        teams.set('test', {
            name: 'test',
            hashedName: crypto.createHash('sha256').update('test').digest('hex'),
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
        });
        teams.set('SMHR', {
            name: 'SMHR',
            hashedName: crypto.createHash('sha256').update('SMHR').digest('hex'),
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
        });
        hashedTeamnames.set(crypto.createHash('sha256').update('test').digest('hex'), 'test');
        hashedTeamnames.set(crypto.createHash('sha256').update('SMHR').digest('hex'), 'SMHR');
        console.log(`Hash for team 'test': ${crypto.createHash('sha256').update('test').digest('hex')}`);
        console.log(`Hash for team 'SMHR': ${crypto.createHash('sha256').update('SMHR').digest('hex')}`);

    }
}
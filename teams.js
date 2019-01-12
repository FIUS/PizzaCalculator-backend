const HashMap = require('hashmap');
let teams = new HashMap();

module.exports = class DBController {
    has(team) {
        return teams.has(team);
    }

    set(teamname, data) {
        teams.set(teamname, data);
    }

    keys() {
        return teams.keys();
    }

    setTestTeams() {
        teams.set('test', {
            name: 'test',
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
        });
        teams.set('SMHR', {
            name: 'SMHR',
            teamsize: {
                number: 0,
                type: null
            },
            pizzaCount: 0
        });
    }
}
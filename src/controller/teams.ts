import HashMap = require('hashmap');
import * as crypto from "crypto"; // TODO import only needed functions
let teams: HashMap<string, any> = new HashMap();
let hashedTeamnames: HashMap<string, string> = new HashMap();

class Teams {
    has(team: string): boolean {
        return teams.has(team);
    }

    hasHash(team: string): boolean {
        return hashedTeamnames.has(team);
    }

    set(teamname: string, data: any): void {
        teams.set(teamname, data);
    }

    setHash(hashedName: string, originalName: string): void {
        hashedTeamnames.set(hashedName, originalName);
    }

    keys(): string[] {
        return teams.keys();
    }

    hashKeys(): string[] {
        return hashedTeamnames.keys();
    }

    getPublicTeams(): string[] {
        return teams.values().filter((team: any) => {
            return team.public;
        }).map((team: any) => {
            return team.name;
        });
    }

    get(teamname: string): any {
        if (teams.has(teamname)) {
            return teams.get(teamname);
        }
        throw new Error('No such team in teamnames');
    }

    getTeamnameOfHash(hashedName: string): string {
        if (hashedTeamnames.has(hashedName)) {
            return hashedTeamnames.get(hashedName);
        }
        throw new Error('No such team in hashedTeamnames');
    }

    recalculatePizzaCount(teamname: string): void {
        let team = teams.get(teamname);
        if (team.teamSize.type === 'persons') {
            team.pizzaCount = Math.ceil(team.teamSize.size / 2);
        } else {
            team.pizzaCount = Math.ceil(team.teamSize.size / 8);
        }
        console.log(team.teamSize);
    }

    setTestTeams(): void {
        teams.set('test', {
            name: 'test',
            hashedName: crypto.createHash('sha256').update('test').digest('hex'),
            teamSize: {
                size: 2,
                type: 'persons'
            },
            public: true,
            pizzaCount: 1,
            voteMode: 'std',
            freeze: false,
            vegetarian: 0,
            noPork: 0
        });
        teams.set('SMHR', {
            name: 'SMHR',
            hashedName: crypto.createHash('sha256').update('SMHR').digest('hex'),
            teamSize: {
                size: 0,
                type: 'persons'
            },
            public: false,
            pizzaCount: 0,
            voteMode: 'std',
            freeze: false,
            vegetarian: 0,
            noPork: 0
        });
        hashedTeamnames.set(crypto.createHash('sha256').update('test').digest('hex'), 'test');
        hashedTeamnames.set(crypto.createHash('sha256').update('SMHR').digest('hex'), 'SMHR');
        console.log(`Hash for team 'test': ${crypto.createHash('sha256').update('test').digest('hex')}`);
        console.log(`Hash for team 'SMHR': ${crypto.createHash('sha256').update('SMHR').digest('hex')}`);

    }
}

export = Teams;
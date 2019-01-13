const HashMap = require('hashmap');

const sessions = new HashMap();

module.exports = class Sessions { 
    has(session) {
        return sessions.has(session);
    }

    keys() {
        return sessions.keys();
    }

    set(session, data) {
        sessions.set(session, data);
    }

    get(session) {
        return sessions.get(session);
    }
}
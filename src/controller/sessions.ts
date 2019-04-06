import HashMap = require('hashmap');

const sessions: HashMap<string, string> = new HashMap();

class Sessions { 
    has(session: string): boolean {
        return sessions.has(session);
    }

    keys(): string[] {
        return sessions.keys();
    }

    set(session: string, data: string): void {
        sessions.set(session, data);
    }

    get(session: string): string {
        return sessions.get(session);
    }

    setupSessions(): void {
        sessions.set('1234567', '1234567');
    }
}

export = Sessions;
import { BracketEngine } from "../core/bracketEngine.js";

export class AppController {
    constructor({ state, dataService, i18n }) {
        this.state = state;
        this.dataService = dataService;
        this.i18n = i18n;

        this.listeners = new Set(); // UI renderer-y
    }

    onRender(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    start() {
        this.dataService.onUpdate((evt) => {
            if (!evt.ok) {
                // UI pokaże błąd / fallback, ale zachowujemy poprzednie dane jeśli są
                this.emit({ type: "error", error: evt.error });
                return;
            }

            // propagate bracket
            const tournament = evt.data;
            BracketEngine.propagate(tournament);
            const outcomes = BracketEngine.computeTeamOutcomes(tournament);

            this.state.tournament = tournament;
            this.state.outcomes = outcomes;
            this.state.lastUpdatedAt = new Date().toISOString();

            // jeżeli JSON trzyma default lang, można tu ustawić
            this.emit({ type: "data", state: this.state });
        });

        this.dataService.startPolling();
    }

    setLang(lang) {
        this.state.lang = lang;
        this.i18n.setLang(lang);
        this.emit({ type: "lang", state: this.state });
    }

    emit(payload) {
        for (const cb of this.listeners) cb(payload);
    }
}

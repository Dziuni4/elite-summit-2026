export class AppState {
    constructor() {
        this.tournament = null;
        this.outcomes = null; // Map teamId -> {status, place}
        this.lang = "pl";
        this.lastUpdatedAt = null;
    }
}

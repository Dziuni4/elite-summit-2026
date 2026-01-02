import { ValidationError } from "./errors.js";

/**
 * Statusy meczów:
 * - upcoming: jeszcze nie grany
 * - live: trwa
 * - finished: zakończony
 */
export const MatchStatus = Object.freeze({
    UPCOMING: "upcoming",
    LIVE: "live",
    FINISHED: "finished",
});

export const Stage = Object.freeze({
    QF1: "qf1",
    QF2: "qf2",
    QF3: "qf3",
    QF4: "qf4",
    SF1: "sf1",
    SF2: "sf2",
    FINAL: "final",
    THIRD: "third",
});


/**
 * Jeden wynik mapy w BO3.
 * Example:
 * { map: "Mirage", a: 13, b: 9 }
 */
export class MapResult {
    constructor({ map, a, b }) {
        this.map = (map ?? "").trim();
        this.a = Number.isFinite(a) ? a : (a === null ? null : Number(a));
        this.b = Number.isFinite(b) ? b : (b === null ? null : Number(b));
    }

    validate() {
        if (!this.map) throw new ValidationError("MapResult.map is required");
        // a/b mogą być null w upcoming/live
        if (this.a !== null && (!Number.isInteger(this.a) || this.a < 0)) {
            throw new ValidationError("MapResult.a must be integer >= 0 or null", this);
        }
        if (this.b !== null && (!Number.isInteger(this.b) || this.b < 0)) {
            throw new ValidationError("MapResult.b must be integer >= 0 or null", this);
        }
    }
}

/**
 * Drużyna z graczami (placeholdery ok)
 */
export class Team {
    constructor({ id, name, players = [], captain = null }) {
        this.id = (id ?? "").trim();
        this.name = (name ?? "").trim();
        this.players = Array.isArray(players) ? players.map(String) : [];
        this.captain = captain ? String(captain) : null;
    }

    validate() {
        if (!this.id) throw new ValidationError("Team.id is required");
        if (!this.name) throw new ValidationError("Team.name is required");
        if (!Array.isArray(this.players)) throw new ValidationError("Team.players must be array");
        // Na razie pozwalamy na placeholdery, więc nie wymuszamy 5 graczy.
    }
}

/**
 * Mecz w drabince BO3.
 * teamA/teamB to id drużyn albo null (TBA).
 */
export class Match {
    constructor({
                    id,
                    stage,
                    teamA = null,
                    teamB = null,
                    scheduledAt = null, // ISO string lub null
                    status = MatchStatus.UPCOMING,
                    maps = [], // MapResult[]
                }) {
        this.id = (id ?? "").trim();
        this.stage = stage;
        this.teamA = teamA ? String(teamA) : null;
        this.teamB = teamB ? String(teamB) : null;
        this.scheduledAt = scheduledAt ? String(scheduledAt) : null;
        this.status = status;
        this.maps = Array.isArray(maps) ? maps.map((m) => new MapResult(m)) : [];
    }

    validate() {
        if (!this.id) throw new ValidationError("Match.id is required");
        if (!Object.values(Stage).includes(this.stage)) {
            throw new ValidationError("Match.stage invalid", this.stage);
        }
        if (!Object.values(MatchStatus).includes(this.status)) {
            throw new ValidationError("Match.status invalid", this.status);
        }
        this.maps.forEach((m) => m.validate());
    }

    /**
     * Zwraca { a: liczbaWygranychMap, b: liczbaWygranychMap } dla już wpisanych map.
     * Liczy tylko mapy z a/b != null.
     */
    computeSeriesScore() {
        let aw = 0, bw = 0;
        for (const m of this.maps) {
            if (m.a === null || m.b === null) continue;
            if (m.a > m.b) aw += 1;
            else if (m.b > m.a) bw += 1;
            // remis pomijamy (w CS2 raczej nie powinno się zdarzyć)
        }
        return { a: aw, b: bw };
    }

    /**
     * Zwraca zwycięzcę id drużyny lub null.
     * BO3: pierwszy do 2.
     */
    getWinnerId() {
        const { a, b } = this.computeSeriesScore();
        if (!this.teamA || !this.teamB) return null;
        if (a >= 2 && a > b) return this.teamA;
        if (b >= 2 && b > a) return this.teamB;
        return null;
    }

    getLoserId() {
        const winner = this.getWinnerId();
        if (!winner) return null;
        if (winner === this.teamA) return this.teamB;
        if (winner === this.teamB) return this.teamA;
        return null;
    }
}

/**
 * News/ogłoszenie
 */
export class NewsItem {
    constructor({ id, at, title, body }) {
        this.id = (id ?? "").trim();
        this.at = at ? String(at) : null; // ISO
        this.title = (title ?? "").trim();
        this.body = (body ?? "").trim();
    }

    validate() {
        if (!this.id) throw new ValidationError("NewsItem.id is required");
        if (!this.title) throw new ValidationError("NewsItem.title is required");
        if (!this.body) throw new ValidationError("NewsItem.body is required");
    }
}

/**
 * Konfiguracja streama Twitch
 */
export class TwitchConfig {
    constructor({ channel, parents = [] }) {
        this.channel = (channel ?? "").trim();
        this.parents = Array.isArray(parents) ? parents.map(String) : [];
    }

    validate() {
        if (!this.channel) throw new ValidationError("TwitchConfig.channel is required");
        if (!Array.isArray(this.parents) || this.parents.length === 0) {
            // parents wymagane do działającego embeda, ale w analizie/preview możemy mieć placeholder.
            // Nie rzucamy błędem twardym, tylko zostawiamy to UI.
        }
    }
}

/**
 * Teksty PL/EN trzymamy w kluczach
 */
export class Translations {
    constructor({ pl = {}, en = {} }) {
        this.pl = pl ?? {};
        this.en = en ?? {};
    }
}

/**
 * Cały turniej
 */
export class TournamentData {
    constructor(raw) {
        const {
            meta,
            twitch,
            teams,
            matches,
            news,
            i18n,
        } = raw ?? {};

        this.meta = meta ?? {};
        this.twitch = new TwitchConfig(twitch ?? {});
        this.teams = (teams ?? []).map((t) => new Team(t));
        this.matches = (matches ?? []).map((m) => new Match(m));
        this.news = (news ?? []).map((n) => new NewsItem(n));
        this.i18n = new Translations(i18n ?? {});
    }

    validate() {
        this.twitch.validate();
        this.teams.forEach((t) => t.validate());
        this.matches.forEach((m) => m.validate());
        this.news.forEach((n) => n.validate());

        // Unikalność id
        const teamIds = new Set();
        for (const t of this.teams) {
            if (teamIds.has(t.id)) throw new ValidationError("Duplicate Team.id", t.id);
            teamIds.add(t.id);
        }
        const matchIds = new Set();
        for (const m of this.matches) {
            if (matchIds.has(m.id)) throw new ValidationError("Duplicate Match.id", m.id);
            matchIds.add(m.id);
        }
    }

    getMatchByStage(stage) {
        return this.matches.find((m) => m.stage === stage) ?? null;
    }

    getTeamById(id) {
        return this.teams.find((t) => t.id === id) ?? null;
    }
}

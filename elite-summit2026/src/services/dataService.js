import { TournamentData } from "../core/models.js";
import { NetworkError, ValidationError } from "../core/errors.js";

export class DataService {
    constructor({ url, pollMs = 10_000 }) {
        this.url = url;
        this.pollMs = pollMs;
        this.timer = null;
        this.lastEtag = null;
        this.listeners = new Set();
    }

    onUpdate(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    async fetchOnce() {
        const bust = `cb=${Date.now()}`;
        const fullUrl = this.url.includes("?") ? `${this.url}&${bust}` : `${this.url}?${bust}`;

        let res;
        try {
            res = await fetch(fullUrl, { cache: "no-store" });
        } catch (e) {
            throw new NetworkError("Fetch failed", e);
        }

        if (!res.ok) {
            throw new NetworkError(`HTTP ${res.status} while fetching tournament.json`);
        }

        let raw;
        try {
            raw = await res.json();
        } catch (e) {
            throw new NetworkError("Invalid JSON in tournament.json", e);
        }

        const data = new TournamentData(raw);
        try {
            data.validate();
        } catch (e) {
            if (e instanceof ValidationError) throw e;
            throw new ValidationError("TournamentData validation failed", e);
        }

        return data;
    }

    startPolling() {
        if (this.timer) return;
        const tick = async () => {
            try {
                const data = await this.fetchOnce();
                for (const cb of this.listeners) cb({ ok: true, data });
            } catch (err) {
                for (const cb of this.listeners) cb({ ok: false, error: err });
            }
        };

        tick();
        this.timer = setInterval(tick, this.pollMs);
    }

    stopPolling() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }
}

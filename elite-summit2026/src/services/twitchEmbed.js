export class TwitchEmbed {
    /**
     * Zwraca URL do iframe playera.
     * parents: ["elitesummit2026.pl", "xxx.pages.dev"]
     */
    static buildPlayerUrl({ channel, parents = [], muted = false, autoplay = true }) {
        const base = "https://player.twitch.tv/";
        const params = new URLSearchParams();
        params.set("channel", channel);
        params.set("muted", muted ? "true" : "false");
        params.set("autoplay", autoplay ? "true" : "false");

        for (const p of parents) params.append("parent", p);
        return `${base}?${params.toString()}`;
    }

    static buildChannelUrl(channel) {
        return `https://www.twitch.tv/${encodeURIComponent(channel)}`;
    }

    static hasValidParents(parents) {
        return Array.isArray(parents) && parents.length > 0 && parents.every((p) => typeof p === "string" && p.length > 0);
    }

    /**
     * Jeśli w JSON nie podano parents, spróbuj wyliczyć je z aktualnego hosta.
     * Twitch tego wymaga, inaczej iframe będzie zablokowany.
     */
    static deriveParents(parents = []) {
        if (this.hasValidParents(parents)) return parents;

        const host = window.location.hostname || "localhost";
        const set = new Set([host]);

        // ułatwka dla dev
        if (host === "localhost") set.add("127.0.0.1");
        if (host === "127.0.0.1") set.add("localhost");

        return [...set];
    }
}

import { TwitchEmbed } from "../services/twitchEmbed.js";

export class TwitchRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("liveTitle");
        this.$container = document.getElementById("twitchContainer");
        this.$hint = document.getElementById("twitchHint");
        this.$open = document.getElementById("openTwitch");
    }

    render(tournament) {
        const channel = tournament?.twitch?.channel ?? "";
        const parents = tournament?.twitch?.parents ?? [];

        // tytuł i link
        this.$title.textContent = this.i18n.t("live.title");
        this.$open.textContent = this.i18n.t("live.open");

        if (!channel) {
            this.$container.innerHTML = "";
            this.$hint.textContent = this.i18n.t("live.noChannel");
            this.$open.href = "#";
            return;
        }

        this.$open.href = TwitchEmbed.buildChannelUrl(channel);

        // brak parents => fallback zamiast iframe (żeby nie było "Refused to display")
        if (!TwitchEmbed.hasValidParents(parents)) {
            this.$container.innerHTML = "";
            this.$hint.textContent = this.i18n.t("live.missingParents");
            return;
        }

        const src = TwitchEmbed.buildPlayerUrl({
            channel,
            parents,
            muted: false,
            autoplay: true
        });

        this.$hint.textContent = `parent: ${parents.join(", ")}`;

        this.$container.innerHTML = `
            <div class="ratio">
                <iframe
                    src="${src}"
                    allowfullscreen="true"
                    scrolling="no">
                </iframe>
            </div>
        `;
    }
}

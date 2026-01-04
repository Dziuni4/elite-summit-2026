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
        if (!tournament) return;

        const channel = tournament?.twitch?.channel ?? "";
        const parentsFromJson = tournament?.twitch?.parents ?? [];
        const parents = TwitchEmbed.deriveParents(parentsFromJson);

        // Styl sekcji jak reszta (bez grzebania w index.html)
        const section = this.$title?.closest("section");
        if (section) section.classList.add("section");

        // Tytuł + link
        if (this.$title) this.$title.textContent = this.i18n.t("live.title");

        if (this.$open) {
            this.$open.textContent = this.i18n.t("live.open");
            this.$open.classList.add("btn", "btn--ghost");
            this.$open.target = "_blank";
            this.$open.rel = "noopener";
        }

        if (this.$hint) {
            // hint stylowany, ale domyślnie nie spamujemy
            this.$hint.classList.add("muted", "small");
            this.$hint.removeAttribute("style");
            this.$hint.textContent = "";
        }

        if (!channel) {
            if (this.$container) this.$container.innerHTML = "";
            if (this.$hint) this.$hint.textContent = this.i18n.t("live.noChannel");
            if (this.$open) this.$open.href = "#";
            return;
        }

        if (this.$open) this.$open.href = TwitchEmbed.buildChannelUrl(channel);

        // Jeśli z jakiegoś powodu nadal nie mamy parents (bardzo rzadkie)
        if (!TwitchEmbed.hasValidParents(parents)) {
            if (this.$container) this.$container.innerHTML = "";
            if (this.$hint) this.$hint.textContent = this.i18n.t("live.missingParents");
            return;
        }

        const src = TwitchEmbed.buildPlayerUrl({
            channel,
            parents,
            muted: false,
            autoplay: true,
        });

        if (this.$container) {
            // CSS już masz: .ratio + iframe
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

        // Opcjonalnie: pokaż parents tylko w dev (jak chcesz)
        // if (this.$hint) this.$hint.textContent = `parent: ${parents.join(", ")}`;
    }
}

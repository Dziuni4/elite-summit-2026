export class TeamsRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("teamsTitle");
        this.$hint = document.getElementById("teamsHint");
        this.$grid = document.getElementById("teamsGrid");
    }

    render(tournament, outcomes) {
        if (!tournament || !this.$grid) return;

        if (this.$title) {
            this.$title.textContent = this.i18n.t("teams.title");
        }
        if (this.$hint) {
            this.$hint.textContent = this.i18n.t("teams.hint");
        }

        const teams = tournament.teams ?? [];

        this.$grid.innerHTML = teams
            .map((team) => {
                const outcome = outcomes?.get(team.id) ?? { status: "playing", place: null };
                return this.teamCardHtml(team, outcome);
            })
            .join("");
    }

    teamCardHtml(team, outcome) {
        const badgeText = this.badgeText(outcome);
        const badgeClass = this.badgeClass(outcome);

        const playersHtml = (team.players ?? [])
            .map((p) => `<li>${this.escape(p)}</li>`)
            .join("");

        return `
      <div class="teamcard">
        <div class="teamcard__head">
          <strong class="teamname">${this.escape(team.name)}</strong>
          <span class="teambadge ${badgeClass}">
            ${badgeText}
          </span>
        </div>

        <div class="teamsection">
          <div class="teamsection__title">
            ${this.i18n.t("teams.players")}
          </div>
          <ul class="teamplayers">
            ${playersHtml || `<li class="muted">—</li>`}
          </ul>
        </div>

        <div class="teammeta">
          ${this.i18n.t("teams.captain")}: 
          <strong>${this.escape(team.captain ?? "—")}</strong>
        </div>
      </div>
    `;
    }

    badgeText(outcome) {
        if (outcome.place === 1) {
            return this.i18n.t("teams.status.winner");
        }

        if (typeof outcome.place === "number") {
            return `${this.i18n.t("teams.place")} ${outcome.place}`;
        }

        if (outcome.status === "odpadli" || outcome.status === "eliminated") {
            return this.i18n.t("teams.status.eliminated");
        }

        return this.i18n.t("teams.status.playing");
    }

    badgeClass(outcome) {
        if (outcome.place === 1) return "winner";
        if (typeof outcome.place === "number") return "place";
        if (outcome.status === "odpadli" || outcome.status === "eliminated") return "out";
        return "";
    }

    escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}

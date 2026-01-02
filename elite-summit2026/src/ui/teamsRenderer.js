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
            // dopasowanie do styles.css (muted/small)
            this.$hint.classList.add("muted", "small");
            // jeśli wcześniej miał inline opacity w HTML, to zostanie, ale klasy i tak zadziałają
        }

        const teams = Array.isArray(tournament.teams) ? tournament.teams : [];

        this.$grid.innerHTML = teams
            .map((team) => {
                const outcome = this.getOutcome(outcomes, team?.id);
                return this.teamCardHtml(team, outcome);
            })
            .join("");
    }

    getOutcome(outcomes, teamId) {
        // wspieramy Map oraz zwykły obiekt { [id]: outcome }
        const fallback = { status: "playing", place: null };

        if (!teamId || !outcomes) return fallback;

        if (typeof outcomes.get === "function") {
            return outcomes.get(teamId) ?? fallback;
        }

        if (typeof outcomes === "object") {
            return outcomes[teamId] ?? fallback;
        }

        return fallback;
    }

    teamCardHtml(team, outcome) {
        const name = this.escape(team?.name ?? "—");
        const captain = this.escape(team?.captain ?? "—");

        const badgeText = this.badgeText(outcome);
        const badgeClass = this.badgeClass(outcome);

        const players = Array.isArray(team?.players) ? team.players : [];
        const playersHtml = players.length
            ? players.map((p) => `<li>${this.escape(p)}</li>`).join("")
            : `<li class="muted">—</li>`;

        // UWAGA: używamy WYŁĄCZNIE klas, które istnieją w styles.css:
        // teamcard, teamcard__head, teambadge (+ winner/place/out), teamplayers, teammeta, muted, small
        return `
      <article class="teamcard">
        <header class="teamcard__head">
          <strong>${name}</strong>
          <span class="teambadge ${badgeClass}">${badgeText}</span>
        </header>

        <ul class="teamplayers">
          ${playersHtml}
        </ul>

        <div class="teammeta">
          ${this.i18n.t("teams.captain")}: <strong>${captain}</strong>
          <span class="muted">•</span>
          <span class="muted">${this.i18n.t("teams.players")}: ${players.length}</span>
        </div>
      </article>
    `;
    }

    badgeText(outcome) {
        if (outcome?.place === 1) {
            return this.i18n.t("teams.status.winner");
        }

        if (typeof outcome?.place === "number") {
            return `${this.i18n.t("teams.place")} ${outcome.place}`;
        }

        if (outcome?.status === "odpadli" || outcome?.status === "eliminated") {
            return this.i18n.t("teams.status.eliminated");
        }

        return this.i18n.t("teams.status.playing");
    }

    badgeClass(outcome) {
        if (outcome?.place === 1) return "winner";
        if (typeof outcome?.place === "number") return "place";
        if (outcome?.status === "odpadli" || outcome?.status === "eliminated") return "out";
        return "";
    }

    escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

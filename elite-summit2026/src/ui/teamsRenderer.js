export class TeamsRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("teamsTitle");
        this.$hint = document.getElementById("teamsHint");
        this.$grid = document.getElementById("teamsGrid");
    }

    render(tournament, outcomes) {
        if (!tournament || !outcomes) return;

        this.$title.textContent = this.i18n.t("teams.title");
        this.$hint.textContent = this.i18n.t("teams.hint");

        const cards = tournament.teams.map((team) => {
            const outcome = outcomes.get(team.id) ?? { status: "w grze", place: null };
            return this.teamCardHtml(team, outcome);
        });

        this.$grid.innerHTML = cards.join("");
    }

    teamCardHtml(team, outcome) {
        const statusLabel = this.statusLabel(outcome);
        const badgeStyle = this.badgeStyle(outcome);

        const playersHtml = team.players.map((p) => `<li>${p}</li>`).join("");

        return `
      <div style="border:1px solid #ddd;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;">
        
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <strong style="font-size:1.05rem;">${team.name}</strong>
          <span style="padding:4px 10px;border-radius:999px;font-size:.85rem;font-weight:800;${badgeStyle}">
            ${statusLabel}
          </span>
        </div>

        <div>
          <div style="font-weight:700;margin-bottom:4px;">${this.i18n.t("teams.players")}</div>
          <ul style="margin:0;padding-left:18px;line-height:1.6;">
            ${playersHtml}
          </ul>
        </div>

        <div style="font-size:.9rem;opacity:.85;">
          ${this.i18n.t("teams.captain")}: <strong>${team.captain ?? "—"}</strong>
        </div>

        ${outcome.place ? `
          <div style="margin-top:6px;padding-top:8px;border-top:1px solid #eee;font-weight:800;">
            ${this.i18n.t("teams.place")}: ${outcome.place}
          </div>
        ` : ""}
      </div>
    `;
    }

    statusLabel(outcome) {
        if (outcome.place === 1) return this.i18n.t("teams.status.winner");
        if (outcome.place !== null) return `${this.i18n.t("teams.place")} ${outcome.place}`;
        if (outcome.status === "odpadli") return this.i18n.t("teams.status.eliminated");
        return this.i18n.t("teams.status.playing");
    }

    badgeStyle(outcome) {
        if (outcome.place === 1) return "background:#f5c24a;color:#000;";
        if (outcome.place !== null) return "background:#ddd;color:#000;";
        if (outcome.status === "odpadli") return "background:#eee;color:#666;";
        return "background:#cde;color:#000;";
    }
}

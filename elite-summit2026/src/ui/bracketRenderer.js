import { Stage, MatchStatus } from "../core/models.js";

export class BracketRenderer {
    constructor({ i18n, tournament }) {
        this.i18n = i18n;
        this.tournament = tournament;
    }

    render(tournament) {
        this.tournament = tournament;

        this.renderStage("qf1", "match-qf1");
        this.renderStage("qf2", "match-qf2");
        this.renderStage("qf3", "match-qf3");
        this.renderStage("qf4", "match-qf4");

        this.renderStage("sf1", "match-sf1");
        this.renderStage("sf2", "match-sf2");

        this.renderStage("final", "match-final");
        this.renderStage("third", "match-third");
    }


    renderStage(stage, containerId) {
        const m = this.tournament.getMatchByStage(stage);
        const el = document.getElementById(containerId);
        if (!el) return;

        if (!m) {
            el.innerHTML = this.cardHtml({ title: "—", body: "<p>Brak meczu</p>" });
            return;
        }

        const teamA = m.teamA ? this.tournament.getTeamById(m.teamA)?.name : null;
        const teamB = m.teamB ? this.tournament.getTeamById(m.teamB)?.name : null;

        const teamsLabelA = teamA ?? this.i18n.t("common.tba");
        const teamsLabelB = teamB ?? this.i18n.t("common.tba");

        const { date, time } = this.formatDateTime(m.scheduledAt);

        const statusLabel = this.statusLabel(m.status);
        const statusDot = this.statusDotClass(m.status);

        const series = m.computeSeriesScore(); // maps won
        const seriesText = (m.teamA && m.teamB) ? `${series.a}:${series.b}` : "—";

        const mapsHtml = this.mapsTableHtml(m);

        const body = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="width:10px;height:10px;border-radius:999px;display:inline-block;background:#999;" class="${statusDot}"></span>
          <strong style="opacity:.95">${statusLabel}</strong>
        </div>
        <div style="opacity:.85">
          <span>${date}</span> • <span>${time}</span>
        </div>
      </div>

      <div style="border:1px solid #ddd;padding:10px;border-radius:10px;display:grid;gap:8px;">
        ${this.teamRowHtml(teamsLabelA, seriesText, "A", m.getWinnerId() === m.teamA)}
        ${this.teamRowHtml(teamsLabelB, seriesText, "B", m.getWinnerId() === m.teamB)}
      </div>

      <div style="margin-top:10px;">
        <div style="font-weight:700;margin-bottom:6px;">Mapy (BO3)</div>
        ${mapsHtml}
      </div>
    `;

        el.innerHTML = this.cardHtml({ title: m.id, body });
    }

    teamRowHtml(teamName, seriesText, side, isWinner) {
        // pokazujemy wynik serii tylko raz, w środku UI będzie później ładniej
        const winStyle = isWinner ? "background:rgba(0,128,0,.10);border-color:rgba(0,128,0,.35)" : "";
        return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #eee;padding:10px;border-radius:10px;${winStyle}">
        <span><strong>${teamName}</strong></span>
        <span style="font-weight:900;">${seriesText}</span>
      </div>
    `;
    }

    mapsTableHtml(match) {
        const rows = (match.maps ?? []).map((mr) => {
            const a = (mr.a === null ? "—" : mr.a);
            const b = (mr.b === null ? "—" : mr.b);
            return `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${mr.map}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${a}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${b}</td>
        </tr>
      `;
        }).join("");

        return `
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Mapa</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">A</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">B</th>
          </tr>
        </thead>
        <tbody>${rows || ""}</tbody>
      </table>
    `;
    }

    cardHtml({ title, body }) {
        return `
      <div style="border:1px solid #ccc;border-radius:14px;padding:14px;">
        <div style="opacity:.65;font-size:12px;margin-bottom:8px;">${title}</div>
        ${body}
      </div>
    `;
    }

    statusLabel(status) {
        switch (status) {
            case MatchStatus.LIVE: return "LIVE";
            case MatchStatus.FINISHED: return "Zakończony";
            default: return "Nadchodzący";
        }
    }

    statusDotClass(status) {
        // użyjemy prościutkich klas inline przez style tag w przyszłości,
        // na razie zwracamy string, a kropkę zostawimy szarą (później pod CSS).
        // Możesz już teraz zrobić w CSS jeśli chcesz.
        return `status-${status}`;
    }

    formatDateTime(iso) {
        if (!iso) return { date: this.i18n.t("common.tba"), time: "" };
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return { date: this.i18n.t("common.tba"), time: "" };

        const date = d.toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
        const time = d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
    }
}

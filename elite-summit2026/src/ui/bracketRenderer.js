import { MatchStatus } from "../core/models.js";

export class BracketRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;
        this.tournament = null;
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

        this.renderChampion("match-champion");
    }

    renderStage(stage, containerId) {
        const m = this.tournament.getMatchByStage(stage);
        const el = document.getElementById(containerId);
        if (!el) return;

        if (!m) { el.innerHTML = ""; return; }

        const nameA = m.teamA ? (this.tournament.getTeamById(m.teamA)?.name ?? m.teamA) : this.i18n.t("common.tba");
        const nameB = m.teamB ? (this.tournament.getTeamById(m.teamB)?.name ?? m.teamB) : this.i18n.t("common.tba");

        const winnerId = m.getWinnerId();
        const winnerA = winnerId && winnerId === m.teamA;
        const winnerB = winnerId && winnerId === m.teamB;

        const { a, b } = m.computeSeriesScore();
        const seriesText = (m.teamA && m.teamB) ? `${a}:${b}` : "—";

        const pillClass =
            m.status === MatchStatus.LIVE ? "majorPill live" :
                (m.status === MatchStatus.FINISHED ? "majorPill finished" : "majorPill");

        const statusText =
            m.status === MatchStatus.LIVE ? "LIVE" :
                (m.status === MatchStatus.FINISHED ? "FINISHED" : "UPCOMING");

        const detailsHtml = this.detailsHtml(m, nameA, nameB, seriesText);

        // data-attr do obsługi click na mobile
        el.innerHTML = `
    <div class="majorMatch" data-match="${m.id}">
      <div class="${pillClass}">${statusText}</div>

      ${this.teamBarHtml(nameA, seriesText, winnerA)}
      ${this.teamBarHtml(nameB, seriesText, winnerB)}

      ${detailsHtml}
    </div>
  `;
    }


    renderChampion(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const finalMatch = this.tournament.getMatchByStage("final");
        const champId = finalMatch?.getWinnerId() ?? null;
        const champName = champId ? (this.tournament.getTeamById(champId)?.name ?? champId) : this.i18n.t("common.tba");

        el.innerHTML = `
      <div class="majorMatch majorChampion">
        <div class="majorChampionLabel">CHAMPIONS</div>
        <div class="majorTeam ${champId ? "isWinner" : ""}">
          <div class="majorTeam__left">
            <div class="majorIcon">★</div>
            <div class="majorName">${champName}</div>
          </div>
          <div class="majorScore"></div>
        </div>
      </div>
    `;
    }

    teamBarHtml(teamName, seriesText, isWinner) {
        return `
      <div class="majorTeam ${isWinner ? "isWinner" : ""}">
        <div class="majorTeam__left">
          <div class="majorIcon"></div>
          <div class="majorName">${this.escape(teamName)}</div>
        </div>
        <div class="majorScore">${seriesText}</div>
      </div>
    `;
    }

    detailsHtml(match, nameA, nameB, seriesText) {
        const maps = match.maps ?? [];

        // jeśli nie ma map w JSON, to nie pokazuj tooltipa
        if (!maps.length) return "";

        return `
    <div class="matchDetails" aria-hidden="true">
      <div class="matchDetails__head">
        <div class="matchDetails__title">${this.escape(nameA)} vs ${this.escape(nameB)}</div>
        <div class="matchDetails__meta">BO3 • ${seriesText}</div>
      </div>

      <table class="matchDetails__table">
        <thead>
          <tr>
            <th>Map</th>
            <th>A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          ${this.mapsRowsHtml(match)}
        </tbody>
      </table>
    </div>
  `;
    }

    mapsRowsHtml(match) {
        return (match.maps ?? []).map((mr, idx) => {
            const aScore = (mr.a === null ? "—" : mr.a);
            const bScore = (mr.b === null ? "—" : mr.b);

            const hasScore = (mr.a !== null && mr.b !== null);
            const aWon = hasScore && mr.a > mr.b;
            const bWon = hasScore && mr.b > mr.a;

            const chip = aWon
                ? `<span class="chip won">A won</span>`
                : (bWon ? `<span class="chip won">B won</span>` : ``);

            return `
      <tr>
        <td>
          <span class="mapWin">
            ${this.escape(mr.map || `Map ${idx + 1}`)}
            ${chip}
          </span>
        </td>
        <td>${aScore}</td>
        <td>${bScore}</td>
      </tr>
    `;
        }).join("");
    }



    escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}

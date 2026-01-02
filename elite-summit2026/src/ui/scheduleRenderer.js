import { MatchStatus } from "../core/models.js";

export class ScheduleRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("scheduleTitle");
        this.$body = document.getElementById("scheduleBody");
        this.$hint = document.getElementById("scheduleHint");

        this.$colMatch = document.getElementById("schColMatch");
        this.$colTeams = document.getElementById("schColTeams");
        this.$colDate = document.getElementById("schColDate");
        this.$colTime = document.getElementById("schColTime");
        this.$colStatus = document.getElementById("schColStatus");
    }

    render(tournament) {
        if (!tournament) return;

        // nagłówki (PL/EN)
        this.$title.textContent = this.i18n.t("schedule.title");
        this.$hint.textContent = this.i18n.t("schedule.hint");
        this.$colMatch.textContent = this.i18n.t("schedule.col.match");
        this.$colTeams.textContent = this.i18n.t("schedule.col.teams");
        this.$colDate.textContent = this.i18n.t("schedule.col.date");
        this.$colTime.textContent = this.i18n.t("schedule.col.time");
        this.$colStatus.textContent = this.i18n.t("schedule.col.status");

        const matches = [...(tournament.matches ?? [])];

        // sort: najpierw te z datą, potem TBA
        matches.sort((a, b) => {
            const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
            const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
            return ta - tb;
        });

        const rowsHtml = matches.map((m) => this.rowHtml(tournament, m)).join("");
        this.$body.innerHTML = rowsHtml;
    }

    rowHtml(tournament, match) {
        const stageLabel = this.stageLabel(match.stage);

        const aName = match.teamA ? (tournament.getTeamById(match.teamA)?.name ?? match.teamA) : this.i18n.t("common.tba");
        const bName = match.teamB ? (tournament.getTeamById(match.teamB)?.name ?? match.teamB) : this.i18n.t("common.tba");

        const { date, time } = this.formatDateTime(match.scheduledAt);

        const statusText = this.statusLabel(match.status);
        const dot = this.dot(match.status);

        // wynik serii (BO3): np 2:1
        const series = match.computeSeriesScore();
        const seriesText = (match.teamA && match.teamB) ? `${series.a}:${series.b}` : "—";

        return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">
          <strong>${stageLabel}</strong>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">
          ${aName} vs ${bName}
          <span style="opacity:.75;margin-left:8px;font-weight:700;">(${seriesText})</span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${date}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${time}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">
          <span style="display:inline-flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:999px;display:inline-block;${dot}"></span>
            <span style="font-weight:800;">${statusText}</span>
          </span>
        </td>
      </tr>
    `;
    }

    stageLabel(stage) {
        // stage: qf1/qf2/qf3/qf4/sf1/sf2/final/third
        if (stage?.startsWith("qf")) return `${this.i18n.t("stage.qf")} ${stage.replace("qf", "")}`;
        if (stage?.startsWith("sf")) return `${this.i18n.t("stage.sf")} ${stage.replace("sf", "")}`;
        if (stage === "final") return this.i18n.t("stage.final");
        if (stage === "third") return this.i18n.t("stage.third");
        return stage ?? "—";
    }

    statusLabel(status) {
        switch (status) {
            case MatchStatus.LIVE: return this.i18n.t("status.live");
            case MatchStatus.FINISHED: return this.i18n.t("status.finished");
            default: return this.i18n.t("status.upcoming");
        }
    }

    dot(status) {
        // bez CSS, prosto inline
        if (status === MatchStatus.LIVE) return "background:#ff7a18;";
        if (status === MatchStatus.FINISHED) return "background:#f5c24a;";
        return "background:#999;";
    }

    formatDateTime(iso) {
        if (!iso) return { date: this.i18n.t("common.tba"), time: "" };
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return { date: this.i18n.t("common.tba"), time: "" };

        // PL/EN format możesz później dopracować — na razie ładne i czytelne
        const date = d.toLocaleDateString(this.i18n.lang === "en" ? "en-GB" : "pl-PL",
            { year: "numeric", month: "2-digit", day: "2-digit" }
        );
        const time = d.toLocaleTimeString(this.i18n.lang === "en" ? "en-GB" : "pl-PL",
            { hour: "2-digit", minute: "2-digit" }
        );
        return { date, time };
    }
}

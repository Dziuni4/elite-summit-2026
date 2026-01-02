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
        if (this.$title) this.$title.textContent = this.i18n.t("schedule.title");
        if (this.$hint) this.$hint.textContent = this.i18n.t("schedule.hint");

        if (this.$colMatch) this.$colMatch.textContent = this.i18n.t("schedule.col.match");
        if (this.$colTeams) this.$colTeams.textContent = this.i18n.t("schedule.col.teams");
        if (this.$colDate) this.$colDate.textContent = this.i18n.t("schedule.col.date");
        if (this.$colTime) this.$colTime.textContent = this.i18n.t("schedule.col.time");
        if (this.$colStatus) this.$colStatus.textContent = this.i18n.t("schedule.col.status");

        const matches = [...(tournament.matches ?? [])];

        // sort: najpierw te z datą (rosnąco), TBA na końcu
        matches.sort((a, b) => {
            const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
            const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
            return ta - tb;
        });

        if (!this.$body) return;

        this.$body.innerHTML = matches.map((m) => this.rowHtml(tournament, m)).join("");
    }

    rowHtml(tournament, match) {
        const stageLabel = this.stageLabel(match.stage);

        const aName = match.teamA
            ? (tournament.getTeamById(match.teamA)?.name ?? match.teamA)
            : this.i18n.t("common.tba");

        const bName = match.teamB
            ? (tournament.getTeamById(match.teamB)?.name ?? match.teamB)
            : this.i18n.t("common.tba");

        const { date, time } = this.formatDateTime(match.scheduledAt);

        const statusText = this.statusLabel(match.status);
        const dotClass =
            match.status === MatchStatus.LIVE
                ? "dot live"
                : (match.status === MatchStatus.FINISHED ? "dot finished" : "dot");

        const series = match.computeSeriesScore();
        const seriesText = (match.teamA && match.teamB) ? `${series.a}:${series.b}` : "—";

        return `
      <tr>
        <td>
          <strong>${stageLabel}</strong>
        </td>

        <td>
          ${this.escape(aName)} vs ${this.escape(bName)}
          <span class="muted" style="margin-left:8px;font-weight:900;">(${seriesText})</span>
        </td>

        <td>${date}</td>
        <td>${time}</td>

        <td>
          <span class="badge">
            <span class="${dotClass}"></span>
            <span style="font-weight:900;">${statusText}</span>
          </span>
        </td>
      </tr>
    `;
    }

    stageLabel(stage) {
        if (stage?.startsWith("qf")) return `${this.i18n.t("stage.qf")} ${stage.replace("qf", "")}`;
        if (stage?.startsWith("sf")) return `${this.i18n.t("stage.sf")} ${stage.replace("sf", "")}`;
        if (stage === "final") return this.i18n.t("stage.final");
        if (stage === "third") return this.i18n.t("stage.third");
        return stage ?? "—";
    }

    statusLabel(status) {
        switch (status) {
            case MatchStatus.LIVE:
                return this.i18n.t("status.live");
            case MatchStatus.FINISHED:
                return this.i18n.t("status.finished");
            default:
                return this.i18n.t("status.upcoming");
        }
    }

    formatDateTime(iso) {
        if (!iso) return { date: this.i18n.t("common.tba"), time: "" };

        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return { date: this.i18n.t("common.tba"), time: "" };

        const locale = this.i18n.lang === "en" ? "en-GB" : "pl-PL";

        const date = d.toLocaleDateString(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const time = d.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
        });

        return { date, time };
    }

    escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}

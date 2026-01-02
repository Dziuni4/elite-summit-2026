import { MatchStatus } from "../core/models.js";

export class ScheduleRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("scheduleTitle");
        this.$body = document.getElementById("scheduleBody");
        this.$hint = document.getElementById("scheduleHint");

        this.$wrap = document.getElementById("scheduleWrap");
        this.$table = this.$wrap?.querySelector("table") ?? null;

        this.$colMatch = document.getElementById("schColMatch");
        this.$colTeams = document.getElementById("schColTeams");
        this.$colDate = document.getElementById("schColDate");
        this.$colTime = document.getElementById("schColTime");
        this.$colStatus = document.getElementById("schColStatus");
    }

    render(tournament) {
        if (!tournament) return;

        this.applyLayoutClasses();

        if (this.$title) this.$title.textContent = this.i18n.t("schedule.title");
        if (this.$hint) {
            this.$hint.textContent = this.i18n.t("schedule.hint");
            this.$hint.classList.add("muted", "small");
            this.$hint.removeAttribute("style");
        }

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

    applyLayoutClasses() {
        // sekcja -> .section
        const section = this.$title?.closest("section");
        if (section) section.classList.add("section");

        // wrap -> container + card (żeby pasowało do reszty)
        if (this.$wrap) {
            this.$wrap.classList.add("container", "card");
            this.$wrap.removeAttribute("style");
        }

        // table już ma class="table" w index.html, ale zostawmy na pewno
        if (this.$table) {
            this.$table.classList.add("table");
        }

        // usuń inline style z nagłówków (te #ddd psują dark theme)
        const ths = this.$table?.querySelectorAll("thead th") ?? [];
        ths.forEach((th) => th.removeAttribute("style"));
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

        const statusText = this.statusText(match.status);
        const dotClass =
            match.status === MatchStatus.LIVE
                ? "dot live"
                : match.status === MatchStatus.FINISHED
                    ? "dot finished"
                    : "dot";

        // Wynik serii (np. BO3 2:1) jako pill – pasuje do stylistyki Bracket
        const series = match.computeSeriesScore?.() ?? { a: 0, b: 0 };
        const hasTeams = Boolean(match.teamA && match.teamB);
        const seriesText = hasTeams ? `${series.a}:${series.b}` : "—";

        const pillClass =
            match.status === MatchStatus.LIVE
                ? "pill live"
                : match.status === MatchStatus.FINISHED
                    ? "pill finished"
                    : "pill";

        return `
      <tr>
        <td>
          <span class="pill">${this.escape(stageLabel)}</span>
        </td>

        <td>
          <strong>${this.escape(aName)}</strong>
          <span class="muted">vs</span>
          <strong>${this.escape(bName)}</strong>
          <span style="display:inline-block;margin-left:10px;">
            <span class="${pillClass}">${this.escape(seriesText)}</span>
          </span>
        </td>

        <td class="muted">${this.escape(date)}</td>
        <td class="muted">${this.escape(time)}</td>

        <td>
          <span class="badge">
            <span class="${dotClass}"></span>
            <strong>${this.escape(statusText)}</strong>
          </span>
        </td>
      </tr>
    `;
    }

    stageLabel(stage) {
        // Jeżeli masz enum/stałe w models, to można to rozbudować.
        // Na razie: fallback do "stage" albo TBA.
        if (!stage) return this.i18n.t("common.tba");
        return stage;
    }

    statusText(status) {
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
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

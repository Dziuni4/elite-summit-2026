export class RulesRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("rulesTitle");

        this.$feesTitle = document.getElementById("feesTitle");
        this.$feesText = document.getElementById("feesText");
        this.$feesSummary = document.getElementById("feesSummary");
        this.$payments = document.getElementById("paymentsText");

        this.$rulesShortTitle = document.getElementById("rulesShortTitle");
        this.$rulesList = document.getElementById("rulesList");
        this.$rulesPdf = document.getElementById("rulesPdfLink");
    }

    render(tournament) {
        if (!tournament) return;

        const meta = tournament.meta ?? {};
        const fee = Number(meta.entryFee ?? meta.fee ?? 0);
        const players = Number(meta.teamSize ?? 5);
        const teamsCount = Number(meta.teamsCount ?? meta.teams ?? 0);
        const total = teamsCount ? teamsCount * players * fee : players * fee;

        // Layout / klasy (żeby pasowało do styles.css i nie było inline)
        this.applyLayoutClasses();

        if (this.$title) this.$title.textContent = this.i18n.t("rules.title");

        if (this.$feesTitle) this.$feesTitle.textContent = this.i18n.t("rules.fees.title");

        if (this.$feesText) {
            this.$feesText.textContent = this.i18n.t("rules.fees.text", { fee });
            this.$feesText.classList.add("muted");
            this.$feesText.removeAttribute("style");
        }

        if (this.$feesSummary) {
            this.$feesSummary.textContent = this.i18n.t("rules.fees.summary", {
                players,
                fee,
                total,
            });
            this.$feesSummary.removeAttribute("style");
        }

        if (this.$payments) {
            this.$payments.textContent = this.i18n.t("rules.payments");
            this.$payments.classList.add("muted", "small");
            this.$payments.removeAttribute("style");
        }

        if (this.$rulesShortTitle) {
            this.$rulesShortTitle.textContent = this.i18n.t("rules.short.title");
        }

        if (this.$rulesList) {
            this.$rulesList.removeAttribute("style");
            this.$rulesList.innerHTML = `
        <li>${this.escape(this.i18n.t("rules.list.1"))}</li>
        <li>${this.escape(this.i18n.t("rules.list.2"))}</li>
        <li>${this.escape(this.i18n.t("rules.list.3"))}</li>
      `;
        }

        if (this.$rulesPdf) {
            if (meta.rulesPdfUrl) {
                this.$rulesPdf.href = meta.rulesPdfUrl;
                this.$rulesPdf.textContent = this.i18n.t("rules.pdf");
                this.$rulesPdf.classList.add("btn");
                this.$rulesPdf.style.display = "inline";
            } else {
                this.$rulesPdf.style.display = "none";
            }
        }
    }

    applyLayoutClasses() {
        const section = this.$title?.closest("section");
        if (section) section.classList.add("section");

        const feesCard = this.$feesTitle?.closest("div");
        const rulesCard = this.$rulesShortTitle?.closest("div");

        if (feesCard) {
            feesCard.classList.add("card");
            feesCard.removeAttribute("style");
        }
        if (rulesCard) {
            rulesCard.classList.add("card");
            rulesCard.removeAttribute("style");
        }

        const grid = feesCard?.parentElement;
        if (grid) {
            grid.classList.add("container", "grid2");
            grid.removeAttribute("style");
        }
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

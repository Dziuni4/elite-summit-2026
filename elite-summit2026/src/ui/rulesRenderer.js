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
        const meta = tournament.meta ?? {};
        const fee = meta.feePerPersonPLN ?? 0;
        const players = meta.playersCount ?? 0;
        const total = fee * players;

        this.$title.textContent = this.i18n.t("rules.title");

        this.$feesTitle.textContent = this.i18n.t("rules.fees.title");
        this.$feesText.textContent = this.i18n.t("rules.fees.text", { fee });
        this.$feesSummary.textContent = this.i18n.t("rules.fees.summary", {
            players,
            fee,
            total
        });

        this.$payments.textContent = this.i18n.t("rules.payments");

        this.$rulesShortTitle.textContent = this.i18n.t("rules.short.title");

        this.$rulesList.innerHTML = `
      <li>${this.i18n.t("rules.list.1")}</li>
      <li>${this.i18n.t("rules.list.2")}</li>
      <li>${this.i18n.t("rules.list.3")}</li>
    `;

        if (meta.rulesPdfUrl) {
            this.$rulesPdf.href = meta.rulesPdfUrl;
            this.$rulesPdf.textContent = this.i18n.t("rules.pdf");
            this.$rulesPdf.style.display = "inline";
        } else {
            this.$rulesPdf.style.display = "none";
        }
    }
}

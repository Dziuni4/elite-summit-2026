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

        // Dopasowanie struktury do styles.css:
        // - sekcja: .section
        // - wrapper: .container.grid2
        // - karty: .card
        this.applyLayoutClasses();

        // Tytuły
        if (this.$title) this.$title.textContent = this.i18n.t("rules.title");

        if (this.$feesTitle) this.$feesTitle.textContent = this.i18n.t("rules.feesTitle");
        if (this.$rulesShortTitle) this.$rulesShortTitle.textContent = this.i18n.t("rules.shortTitle");

        // Wpisowe / płatności
        const entryFee = meta.entryFee ?? meta.fee ?? null; // wspiera różne klucze
        const teamSize = meta.teamSize ?? 5;
        const teamsCount = meta.teamsCount ?? meta.teams ?? null;

        if (this.$feesText) {
            // Możesz trzymać to w i18n, ale fallback też działa
            this.$feesText.textContent =
                this.i18n.t("rules.feesText") ||
                (entryFee
                    ? `Wpisowe: ${entryFee} zł / osoba`
                    : "Wpisowe: —");
            this.$feesText.classList.add("muted");
        }

        if (this.$feesSummary) {
            // Podsumowanie (np. „8 drużyn po 5 osób”)
            let summary = this.i18n.t("rules.feesSummary");
            if (!summary || summary === "rules.feesSummary") {
                const teamsPart = teamsCount ? `${teamsCount} drużyn` : "Drużyny";
                summary = `${teamsPart} po ${teamSize} osób`;
            }
            this.$feesSummary.textContent = summary;
        }

        if (this.$payments) {
            const payments = this.i18n.t("rules.payments") || meta.payments || "";
            this.$payments.textContent = payments;
            this.$payments.classList.add("muted", "small");
            this.$payments.removeAttribute("style");
        }

        // Lista zasad
        if (this.$rulesList) {
            this.$rulesList.removeAttribute("style");

            const list = Array.isArray(meta.rulesShort)
                ? meta.rulesShort
                : [
                    this.i18n.t("rules.list.1"),
                    this.i18n.t("rules.list.2"),
                    this.i18n.t("rules.list.3"),
                ].filter(Boolean);

            this.$rulesList.innerHTML = list.map((x) => `<li>${this.escape(x)}</li>`).join("");
        }

        // PDF z zasadami
        if (this.$rulesPdf) {
            if (meta.rulesPdfUrl) {
                this.$rulesPdf.href = meta.rulesPdfUrl;
                this.$rulesPdf.textContent = this.i18n.t("rules.pdf");
                this.$rulesPdf.style.display = "inline";
                this.$rulesPdf.classList.add("btn"); // w styles.css jest .btn
            } else {
                this.$rulesPdf.style.display = "none";
            }
        }
    }

    applyLayoutClasses() {
        // Sekcja
        const section = this.$title?.closest("section");
        if (section) section.classList.add("section");

        // Karty (najbliższy DIV od nagłówków)
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

        // Wrapper grid (rodzic kart)
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

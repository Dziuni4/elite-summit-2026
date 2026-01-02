export class FooterRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$tournament = document.getElementById("footerTournament");
        this.$organizer = document.getElementById("footerOrganizer");
        this.$discord = document.getElementById("footerDiscord");
        this.$contact = document.getElementById("footerContact");
        this.$year = document.getElementById("footerYear");
    }

    render(tournament) {
        const meta = tournament.meta ?? {};

        this.$tournament.textContent = tournament.meta?.name ?? "Elite Summit 2026";
        this.$organizer.textContent = `${this.i18n.t("footer.organizer")}: ${meta.organizer || "—"}`;

        if (meta.discordUrl) {
            this.$discord.href = meta.discordUrl;
            this.$discord.textContent = this.i18n.t("footer.discord");
            this.$discord.style.display = "inline";
        } else {
            this.$discord.style.display = "none";
        }

        this.$contact.textContent = this.i18n.t("footer.contact");
        this.$contact.href = meta.contact || "#";

        this.$year.textContent = new Date().getFullYear();
    }
}

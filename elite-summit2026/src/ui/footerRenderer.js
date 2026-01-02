export class FooterRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$tournament = document.getElementById("footerTournament");
        this.$organizer = document.getElementById("footerOrganizer");
        this.$discord = document.getElementById("footerDiscord");
        this.$contact = document.getElementById("footerContact");
        this.$year = document.getElementById("footerYear");

        this.$footer = document.getElementById("footer");
    }

    render(tournament) {
        const meta = tournament?.meta ?? {};

        this.applyLayoutClasses();

        if (this.$tournament) {
            this.$tournament.textContent = meta.name ?? "Elite Summit 2026";
        }

        if (this.$organizer) {
            const org = meta.organizer || "—";
            this.$organizer.textContent = `${this.i18n.t("footer.organizer")}: ${org}`;
            this.$organizer.classList.add("muted", "small");
            this.$organizer.removeAttribute("style");
        }

        if (this.$discord) {
            if (meta.discordUrl) {
                this.$discord.href = meta.discordUrl;
                this.$discord.textContent = this.i18n.t("footer.discord");
                this.$discord.style.display = "inline";
            } else {
                this.$discord.style.display = "none";
            }
        }

        if (this.$contact) {
            const contact = meta.contact || meta.contactUrl || null;
            if (contact) {
                this.$contact.textContent = this.i18n.t("footer.contact");
                this.$contact.href = contact;
                this.$contact.style.display = "inline";
            } else {
                this.$contact.style.display = "none";
            }
        }

        if (this.$year) {
            this.$year.textContent = String(new Date().getFullYear());
        }
    }

    applyLayoutClasses() {
        // footer styles.css: .footer, .footer__inner
        if (this.$footer) {
            this.$footer.classList.add("footer");
            this.$footer.removeAttribute("style");

            const inner = this.$footer.querySelector(":scope > div");
            if (inner) {
                inner.classList.add("container", "footer__inner");
                inner.removeAttribute("style");
            }

            // usuń inline style z dzieci (te divy w środku)
            const innerDivs = this.$footer.querySelectorAll(":scope > div > div");
            innerDivs.forEach((d) => d.removeAttribute("style"));
        }
    }
}

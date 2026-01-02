export class NewsRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;
        this.$title = document.getElementById("newsTitle");
        this.$hint = document.getElementById("newsHint");
        this.$list = document.getElementById("newsList");
    }

    render(tournament) {
        if (!tournament) return;

        this.$title.textContent = this.i18n.t("news.title");
        this.$hint.textContent = this.i18n.t("news.hint");

        const items = [...(tournament.news ?? [])];

        // sort: najnowsze na górze, TBA na końcu
        items.sort((a, b) => {
            const ta = a.at ? new Date(a.at).getTime() : Number.NEGATIVE_INFINITY;
            const tb = b.at ? new Date(b.at).getTime() : Number.NEGATIVE_INFINITY;
            // UWAGA: NEGATIVE_INFINITY spowoduje że TBA wyląduje na końcu dopiero przy odwróceniu,
            // więc zrobimy jawnie:
            if (!a.at && !b.at) return 0;
            if (!a.at) return 1;
            if (!b.at) return -1;
            return tb - ta; // malejąco
        });

        if (items.length === 0) {
            this.$list.innerHTML = `
        <div style="border:1px solid #ddd;border-radius:14px;padding:14px;opacity:.8;">
          —
        </div>
      `;
            return;
        }

        this.$list.innerHTML = items.map((n) => this.itemHtml(n)).join("");
    }

    itemHtml(n) {
        const when = n.at ? this.formatDateTime(n.at) : this.i18n.t("news.tba");

        return `
      <article style="border:1px solid #ddd;border-radius:14px;padding:14px;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px;opacity:.85;">
          <span style="font-size:.9rem;"><strong>${this.i18n.t("news.date")}:</strong> ${when}</span>
          <span style="font-size:.8rem;opacity:.75;">#${n.id}</span>
        </div>

        <h3 style="margin:0 0 8px;">${this.escape(n.title)}</h3>
        <p style="margin:0;line-height:1.6;opacity:.9;">${this.escape(n.body)}</p>
      </article>
    `;
    }

    formatDateTime(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return this.i18n.t("news.tba");

        const locale = this.i18n.lang === "en" ? "en-GB" : "pl-PL";
        const date = d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
        const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
        return `${date} ${time}`;
    }

    escape(str) {
        // prosta ochrona, bo w JSON możesz wkleić dowolny tekst
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}

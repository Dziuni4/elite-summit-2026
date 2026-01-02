export class NewsRenderer {
    constructor({ i18n }) {
        this.i18n = i18n;

        this.$title = document.getElementById("newsTitle");
        this.$hint = document.getElementById("newsHint");
        this.$list = document.getElementById("newsList");
    }

    render(tournament) {
        if (!tournament || !this.$list) return;

        if (this.$title) this.$title.textContent = this.i18n.t("news.title");

        if (this.$hint) {
            this.$hint.textContent = this.i18n.t("news.hint");
            this.$hint.classList.add("muted", "small");
            // usuń inline z index.html, żeby działał styles.css
            this.$hint.removeAttribute("style");
        }

        // dopnij klasy z styles.css (i usuń inline z index.html)
        this.$list.classList.add("newsList");
        this.$list.removeAttribute("style");

        const items = [...(tournament.news ?? [])];

        // sort: najnowsze na górze, TBA (brak at) na końcu
        items.sort((a, b) => {
            if (!a?.at && !b?.at) return 0;
            if (!a?.at) return 1;
            if (!b?.at) return -1;
            return new Date(b.at).getTime() - new Date(a.at).getTime();
        });

        if (items.length === 0) {
            this.$list.innerHTML = `
        <article class="newsItem">
          <div class="newsMeta">
            <span class="muted">${this.i18n.t("news.title")}</span>
            <span class="muted small">—</span>
          </div>
          <h3>—</h3>
          <p class="muted">${this.i18n.t("news.empty") ?? "Brak aktualności."}</p>
        </article>
      `;
            return;
        }

        this.$list.innerHTML = items.map((n) => this.itemHtml(n)).join("");
    }

    itemHtml(n) {
        const when = n?.at ? this.formatDateTime(n.at) : this.i18n.t("news.tba");
        const id = n?.id ?? "";

        return `
      <article class="newsItem">
        <div class="newsMeta">
          <span><strong>${this.i18n.t("news.date")}:</strong> ${when}</span>
          <span class="muted small">${id ? `#${this.escape(id)}` : ""}</span>
        </div>

        <h3>${this.escape(n?.title ?? "—")}</h3>
        <p>${this.escape(n?.body ?? "")}</p>
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
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

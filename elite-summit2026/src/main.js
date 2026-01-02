import { AppState } from "./app/state.js";
import { DataService } from "./services/dataService.js";
import { I18n, Lang } from "./core/i18n.js";
import { AppController } from "./app/appController.js";
import { TwitchRenderer } from "./ui/twitchRenderer.js";
import { BracketRenderer } from "./ui/bracketRenderer.js";
import { ScheduleRenderer } from "./ui/scheduleRenderer.js";
import { TeamsRenderer } from "./ui/teamsRenderer.js";
import { NewsRenderer } from "./ui/newsRenderer.js";
import { RulesRenderer } from "./ui/rulesRenderer.js";
import { FooterRenderer } from "./ui/footerRenderer.js";





const state = new AppState();

const dataService = new DataService({
    url: "./data/tournament.json",
    pollMs: 10_000,
});

// i18n uzupełnimy z JSON przy pierwszym fetchu
const i18n = new I18n({ pl: {}, en: {} }, Lang.PL);

const app = new AppController({ state, dataService, i18n });
const twitchRenderer = new TwitchRenderer({ i18n });
let bracketRenderer = null;
let scheduleRenderer = null;
let teamsRenderer = null;
let newsRenderer = null;
let rulesRenderer = null;
let footerRenderer = null;






// Language buttons
document.getElementById("langPL").addEventListener("click", () => app.setLang(Lang.PL));
document.getElementById("langEN").addEventListener("click", () => app.setLang(Lang.EN));

// Wspólny render
app.onRender((evt) => {
    if (evt.type === "error") {
        console.warn("[EliteSummit] Data error:", evt.error);
        return;
    }

    const tournament = evt.state.tournament;

    // załaduj tłumaczenia z JSON przy pierwszym razie
    if (tournament?.i18n) {
        i18n.translations = tournament.i18n;
    }

    // hero teksty
    document.getElementById("heroTag").textContent = i18n.t("hero.tag");
    document.getElementById("heroSubtitle").textContent = i18n.t("hero.subtitle");

    // twitch
    twitchRenderer.render(tournament);

    if (!bracketRenderer) {
        bracketRenderer = new BracketRenderer({ i18n });
    }

    bracketRenderer.render(tournament);

    if (!scheduleRenderer) {
        scheduleRenderer = new ScheduleRenderer({ i18n });
    }
    scheduleRenderer.render(tournament);

    if (!teamsRenderer) {
        teamsRenderer = new TeamsRenderer({ i18n });
    }
    teamsRenderer.render(tournament, evt.state.outcomes);

    if (!newsRenderer) {
        newsRenderer = new NewsRenderer({ i18n });
    }
    newsRenderer.render(tournament);

    if (!rulesRenderer) {
        rulesRenderer = new RulesRenderer({ i18n });
    }
    rulesRenderer.render(tournament);

    if (!footerRenderer) {
        footerRenderer = new FooterRenderer({ i18n });
    }
    footerRenderer.render(tournament);





});

app.start();

// Mobile/touch: klik w mecz przełącza tooltip z mapami
document.addEventListener("click", (e) => {
    const matchEl = e.target.closest?.(".majorMatch");
    if (!matchEl) return;

    // zamknij inne otwarte
    document.querySelectorAll(".majorMatch.showDetails").forEach((el) => {
        if (el !== matchEl) el.classList.remove("showDetails");
    });

    matchEl.classList.toggle("showDetails");
});

// klik poza drabinką zamyka tooltipy
document.addEventListener("click", (e) => {
    const inMatch = e.target.closest?.(".majorMatch");
    if (inMatch) return;
    document.querySelectorAll(".majorMatch.showDetails").forEach((el) => el.classList.remove("showDetails"));
}, true);


// dev helper
window.__elite = { app };

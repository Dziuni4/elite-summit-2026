import { AppState } from "./app/state.js";
import { DataService } from "./services/dataService.js";
import { I18n, Lang } from "./core/i18n.js";
import { AppController } from "./app/appController.js";
import { TwitchRenderer } from "./ui/twitchRenderer.js";
import { BracketRenderer } from "./ui/bracketRenderer.js";


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

});

app.start();

// dev helper
window.__elite = { app };

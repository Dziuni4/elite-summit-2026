export const Lang = Object.freeze({
    PL: "pl",
    EN: "en",
});

export class I18n {
    constructor(translations, initialLang = Lang.PL) {
        this.translations = translations;
        this.lang = initialLang;
        this.listeners = new Set();
    }

    setLang(lang) {
        if (![Lang.PL, Lang.EN].includes(lang)) return;
        this.lang = lang;
        for (const cb of this.listeners) cb(this.lang);
    }

    onChange(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    t(key, vars = {}) {
        const dict = this.translations?.[this.lang] ?? {};
        const fallback = this.translations?.[Lang.PL] ?? {};
        let str = dict[key] ?? fallback[key] ?? key;

        for (const [k, v] of Object.entries(vars)) {
            str = str.replaceAll(`{${k}}`, String(v));
        }
        return str;
    }
}

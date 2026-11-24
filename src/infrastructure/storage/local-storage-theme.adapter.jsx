const STORAGE_KEY = "sortn-sec-theme";
export class LocalStorageThemeAdapter {
    static getStoredTheme() {
        if (typeof window === "undefined")
            return null;
        try {
            const val = localStorage.getItem(STORAGE_KEY);
            if (val === "light" || val === "dark" || val === "system") {
                return val;
            }
        }
        catch (e) { }
        return null;
    }
    static saveTheme(theme) {
        if (typeof window === "undefined")
            return;
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        catch (e) { }
    }
    static applyThemeToDocument(theme) {
        if (typeof document === "undefined")
            return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        }
        else if (theme === "light") {
            root.classList.remove("dark");
        }
        else {
            const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (isSystemDark) {
                root.classList.add("dark");
            }
            else {
                root.classList.remove("dark");
            }
        }
    }
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { LocalStorageThemeAdapter, } from "../../infrastructure/storage/local-storage-theme.adapter";
export function useTheme() {
    const [theme, setThemeState] = useState("system");
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        const stored = LocalStorageThemeAdapter.getStoredTheme();
        const active = stored || "system";
        setThemeState(active);
        LocalStorageThemeAdapter.applyThemeToDocument(active);
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = () => {
            const current = LocalStorageThemeAdapter.getStoredTheme();
            if (!current || current === "system") {
                LocalStorageThemeAdapter.applyThemeToDocument("system");
            }
        };
        mediaQuery.addEventListener("change", handleSystemChange);
        return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }, []);
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        LocalStorageThemeAdapter.saveTheme(newTheme);
        LocalStorageThemeAdapter.applyThemeToDocument(newTheme);
    }, []);
    const toggleTheme = useCallback(() => {
        const isDark = document.documentElement.classList.contains("dark");
        const next = isDark ? "light" : "dark";
        setTheme(next);
    }, [setTheme]);
    return { theme, setTheme, toggleTheme, mounted };
}

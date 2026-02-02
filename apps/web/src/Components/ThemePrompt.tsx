import React from "react";
import { useAuth } from "../lib/auth.context";
import { applyTheme, setThemeOverride, resolve } from "../lib/theme";
import { apiPut } from "../lib/api";
import { useLanguage } from "../lib/locale.context";

export default function ThemePrompt() {
    const { themePrompt, setThemePrompt, user } = useAuth();
    const { activeLanguage } = useLanguage();

    if (!themePrompt) return null;

    async function choose(choice: "light" | "dark" | "system") {
        // aplies and saves override local
        applyTheme(choice);
        setThemeOverride(choice);

        // se logado, tenta gravar no perfil
        if (user) {
            try { await apiPut("/users/profile", { theme: choice }, { softAuth: true }); }
            catch { /*at least local if fail */ }
        }
        setThemePrompt(null);
    }

    async function useProfile() {
        if (themePrompt?.kind !== "mismatch") return;
        const ch = themePrompt.serverChoice;
        await choose(ch);
    }

    async function keepCurrent() {
        const currentResolved = document.documentElement.getAttribute("data-theme") as "light" | "dark";
        await choose(currentResolved);
    }

    // UI bem simples
    return (
        <div style={backdrop} onClick={() => setThemePrompt(null)}>
            <div style={modal} onClick={e => e.stopPropagation()}>
                {themePrompt.kind === "onboarding" ? (
                    <>
                        <h3 style={{ marginTop: 0 }}>{activeLanguage.dictionary.pickTheme}</h3>
                        <p>{activeLanguage.dictionary.themeChoices}</p>
                        <div style={row}>
                            <button type="button" className="btn" onClick={() => choose("light")}>{activeLanguage.dictionary.light}</button>
                            <button type="button" className="btn" onClick={() => choose("dark")}>{activeLanguage.dictionary.dark}</button>
                            <button type="button" className="btn ghost" onClick={() => choose("system")}>{activeLanguage.dictionary.system}</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0 }}>{activeLanguage.dictionary.updateTheme}</h3>
                        <p>{activeLanguage.dictionary.diferentTheme}</p>
                        <div style={row}>
                            <button type="button" className="btn" onClick={useProfile}>
                                {activeLanguage.dictionary.pickProfileTheme} ({resolve(themePrompt.serverChoice)})
                            </button>
                            <button type="button" className="btn ghost" onClick={keepCurrent}>
                                {activeLanguage.dictionary.pickCurrentTheme} ({document.documentElement.getAttribute("data-theme")})
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const backdrop: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
    display: "grid", placeItems: "center", zIndex: 50
};
const modal: React.CSSProperties = {
    background: "var(--bgSecondary)", color: "var(--primary)",
    border: "1px solid var(--bgSecondary)", borderRadius: 14, padding: 20,
    boxShadow: "var(--boxShadow)", width: 420
};
const row: React.CSSProperties = { display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" };
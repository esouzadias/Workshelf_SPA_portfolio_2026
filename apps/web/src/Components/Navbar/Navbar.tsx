// apps/web/src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import "./Navbar.less";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.context";
import { useLanguage } from "../../lib/locale.context";
import { applyTheme, setThemeOverride } from "../../lib/theme";
import { apiPut } from "../../lib/api";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ContrastIcon from "@mui/icons-material/Contrast";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const { activeLanguage, setLocale } = useLanguage();
    const { code, dictionary } = activeLanguage;

    const [open, setOpen] = useState(false);
    const [openLang, setOpenLang] = useState(false);
    const popRef = React.useRef<HTMLDivElement | null>(null);
    const langRef = React.useRef<HTMLDivElement | null>(null);

    async function toggleTheme() {
        const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
        const next: "light" | "dark" = current === "dark" ? "light" : "dark";
        applyTheme(next);
        setThemeOverride(next);
        if (user) { try { await apiPut("/users/profile", { theme: next }, { softAuth: true }); } catch { } }
    }

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node;

            if (open && popRef.current && !popRef.current.contains(target)) {
                setOpen(false);          // fecha avatar
            }
            if (openLang && langRef.current && !langRef.current.contains(target)) {
                setOpenLang(false);      // fecha menu de idioma
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open, openLang]);

    const avatarUrl = user
        ? (user.profile?.avatarUrl ||
            `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.profile?.displayName || user.email)}`)
        : "";

    return (
        <header className="container">
            <div className="nav">
                <div id="logo-container" style={{ display: "flex", gap: 16 }}>
                    <Link to="/" className="brand">WorkShelf</Link>
                    <Link to="/health" className="health-btn">
                        <HealthAndSafetyIcon className="health-btn-icon" fontSize="small" />
                    </Link>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="lang-wrap" ref={langRef}>
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setOpenLang(v => !v)}
                            aria-haspopup="menu"
                            aria-expanded={openLang}
                            title={dictionary.themeToggle}
                        >
                            <span style={{ fontSize: 16 }}>{code === "pt" ? "🇵🇹" : "🇬🇧"}</span>
                        </button>
                        {openLang && (
                            <div className="lang-pop" role="menu">
                                <button type="button" className="menu-item" onClick={() => { setLocale("en"); setOpenLang(false); }}>🇬🇧 English</button>
                                <button type="button" className="menu-item" onClick={() => { setLocale("pt"); setOpenLang(false); }}>🇵🇹 Português</button>
                            </div>
                        )}
                    </div>

                    <button
                        className={`icon-btn theme-toggle ${(document.documentElement.getAttribute("data-theme") || "light") === "dark" ? "is-dark" : "is-light"}`}
                        onClick={toggleTheme}
                        aria-label={dictionary.themeToggle}
                        title={dictionary.themeToggle}
                    >
                        <ContrastIcon className="moon" fontSize="small" />
                    </button>

                    {user ? (
                        <div className="avatar-wrap" ref={popRef}>
                            <button
                                type="button"
                                className={`avatar-btn ${open ? "is-open" : ""}`}
                                onClick={() => setOpen(v => !v)}
                                aria-haspopup="dialog"
                                aria-expanded={open}
                                title={user.profile?.displayName || user.email}
                            >
                                <img src={avatarUrl} alt="avatar" />
                            </button>
                            {open && (
                                <div className="avatar-pop">
                                    <section id="user-info">
                                        <img className="avatar-lg" src={avatarUrl} alt="avatar grande" />
                                        <div className="user-lines">
                                            <div className="name">{user.profile?.displayName || "—"}</div>
                                            <div className="email">{user.email}</div>
                                        </div>
                                    </section>
                                    <div className="actions">
                                        <button type="button" className="btn ghost" onClick={() => { setOpen(false); nav("/profile"); }}>
                                            {activeLanguage.dictionary.editProfile}
                                        </button>
                                        <button type="button" className="btn ghost" onClick={() => { setOpen(false); logout(); nav("/auth"); }}>
                                            {activeLanguage.dictionary.logout}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/auth" className="btn link">{activeLanguage.dictionary.login}</Link>
                            <Link to="/auth" className="btn">{activeLanguage.dictionary.createAccount}</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
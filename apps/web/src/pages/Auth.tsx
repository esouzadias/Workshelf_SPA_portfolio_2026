import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth.context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../lib/locale.context";
import "./Auth.less";

type ApiErrShape = { status: number; code: string | null; message: string };
const API = "http://localhost:4000";

async function postJson<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err: any = new Error(data?.error || data?.message || "Erro");
        err.status = res.status;
        err.code = data?.errorCode ?? data?.code ?? null;
        throw err;
    }
    return data as T;
}

export default function AuthPage() {
    const { login, register, loading } = useAuth();
    const { activeLanguage } = useLanguage();
    const nav = useNavigate();

    const [sp] = useSearchParams();
    const qsMode = sp.get("mode");
    const qsToken = sp.get("token") ?? "";

    const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(
        qsMode === "reset" ? "reset" : "login"
    );

    const [err, setErr] = useState<string>();
    const [info, setInfo] = useState<string>();
    const [busy, setBusy] = useState(false);

    const dict = activeLanguage.dictionary as any;
    const errorDict = (dict?.errors ?? {}) as Record<string, string>;

    const tErr = (ex: unknown) => {
        const maybe = ex as Partial<ApiErrShape> & any;
        const code = typeof maybe?.code === "string" ? maybe.code : null;
        const byCode = code && code in errorDict ? errorDict[code] : undefined;
        return byCode || (typeof maybe?.message === "string" ? maybe.message : "Erro");
    };

    useEffect(() => {
        if (qsMode === "reset") setMode("reset");
    }, [qsMode]);

    const title = useMemo(() => {
        if (mode === "register") return dict.createAccount ?? "Create account";
        if (mode === "forgot") return dict.forgotPassword ?? "Forgot password";
        if (mode === "reset") return dict.resetPassword ?? "Reset password";
        return dict.login ?? "Login";
    }, [dict, mode]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(undefined);
        setInfo(undefined);

        const f = new FormData(e.currentTarget);

        try {
            if (mode === "login") {
                await login(String(f.get("email")), String(f.get("password")));
                nav("/");
                return;
            }

            if (mode === "register") {
                await register(String(f.get("name")), String(f.get("email")), String(f.get("password")));
                nav("/");
                return;
            }

            if (mode === "forgot") {
                setBusy(true);
                const email = String(f.get("email"));

                const resp = await postJson<{ ok: true; devResetUrl?: string }>("/auth/forgot-password", { email });

                setBusy(false);

                if (resp?.devResetUrl) {
                    const url = new URL(resp.devResetUrl);
                    const token = url.searchParams.get("token") ?? "";
                    nav(`/auth?mode=reset&token=${encodeURIComponent(token)}`);
                    return;
                }
                setInfo(dict.resetLinkSent ?? "If the email is registered, a reset link has been sent.");
                return;
            }

            if (mode === "reset") {
                setBusy(true);

                const token = String(f.get("token") || qsToken);
                const newPassword = String(f.get("password"));
                const confirm = String(f.get("confirm"));

                if (newPassword !== confirm) {
                    setBusy(false);
                    setErr(dict.passwordsDontMatch ?? "Passwords do not match");
                    return;
                }

                await postJson<{ ok: true }>("/auth/reset-password", { token, newPassword });

                setBusy(false);
                setInfo(dict.passwordUpdated ?? "Password updated. You can login now.");
                setMode("login");
                return;
            }
        } catch (ex) {
            setBusy(false);
            setErr(tErr(ex));
        }
    }

    const isLoading = loading || busy;

    return (
        <div className="container">
            <div className="auth-shell" style={{ maxWidth: 460, width: "100%", margin: "48px auto" }}>
                <div className="auth-card">
                    <div className="auth-head">
                        <div className="auth-title">
                            <h2 style={{ margin: 0 }}>{title}</h2>
                            <p style={{ margin: 0, opacity: 0.65, fontWeight: 700 }}>
                                {dict?.welcomeAuthHint ?? "Access your account and manage your profile."}
                            </p>
                        </div>

                        {(mode === "login" || mode === "register") && (
                            <div className="tabs" role="tablist" aria-label="auth tabs">
                                <button
                                    className={`tab ${mode === "login" ? "active" : ""}`}
                                    onClick={() => setMode("login")}
                                    type="button"
                                >
                                    {dict.login ?? "Login"}
                                </button>
                                <button
                                    className={`tab ${mode === "register" ? "active" : ""}`}
                                    onClick={() => setMode("register")}
                                    type="button"
                                >
                                    {dict.createAccount ?? "Create account"}
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={onSubmit} className="form-grid" style={{ marginTop: 16 }}>
                        {mode === "register" && (
                            <input className="input" name="name" placeholder={dict.displayName ?? "Display name"} required />
                        )}

                        {(mode === "login" || mode === "register" || mode === "forgot") && (
                            <input className="input" name="email" type="email" placeholder="Email" required />
                        )}

                        {(mode === "login" || mode === "register") && (
                            <input className="input" name="password" type="password" placeholder={dict.password ?? "Password"} required />
                        )}

                        {mode === "reset" && (
                            <>
                                <input className="input" name="token" defaultValue={qsToken} placeholder="Reset token" required />
                                <input className="input" name="password" type="password" placeholder={dict.newPassword ?? "New password"} required />
                                <input className="input" name="confirm" type="password" placeholder={dict.confirmPassword ?? "Confirm password"} required />
                            </>
                        )}

                        <button type="submit" className="btn" disabled={isLoading}>
                            {mode === "login"
                                ? dict.login ?? "Login"
                                : mode === "register"
                                    ? dict.createAccount ?? "Create account"
                                    : mode === "forgot"
                                        ? dict.sendResetLink ?? "Send reset link"
                                        : dict.resetPassword ?? "Reset password"}
                        </button>

                        {mode === "login" && (
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => {
                                    setErr(undefined);
                                    setInfo(undefined);
                                    setMode("forgot");
                                }}
                            >
                                {dict.forgotPassword ?? "Forgot password?"}
                            </button>
                        )}

                        {(mode === "forgot" || mode === "reset") && (
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => {
                                    setErr(undefined);
                                    setInfo(undefined);
                                    setMode("login");
                                }}
                            >
                                {dict.backToLogin ?? "Back to login"}
                            </button>
                        )}

                        {err && <p className="auth-msg auth-msg--err">{err}</p>}
                        {info && <p className="auth-msg auth-msg--ok">{info}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}
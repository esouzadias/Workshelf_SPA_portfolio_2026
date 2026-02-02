import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";
import { getToken as read, setToken as save, clearToken as drop } from "./session";
import { applyTheme, getThemeOverride, resolve, getCurrentResolved } from "./theme";
import type { ThemeChoice } from "./theme";


type User = { id: string; email: string; profile?: { displayName?: string, locale?: string, theme?: string, avatarUrl?: string } };
type ThemePromptState =
  | null
  | { kind: "mismatch"; serverChoice: ThemeChoice }        // perfil tem um tema diferente do aplicado
  | { kind: "onboarding" };                                // conta nova: sem tema no perfil


type Ctx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  themePrompt: ThemePromptState;
  setThemePrompt: (p: ThemePromptState) => void;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themePrompt, setThemePrompt] = useState<ThemePromptState>(null);

  // Carrega token existente e tenta /auth/me
  useEffect(() => {
    const t = read();
    setToken(t);

    const override = getThemeOverride();
    if (override) applyTheme(override);

    if (!t) { setLoading(false); return; }

    apiGet<User>("/auth/me")
      .then(me => {
        setUser(me);

        if (!override) {
          // sem override local, usa o do servidor (se existir), senão system
          applyTheme((me?.profile?.theme ?? "system") as any);
        }

        // perguntar só 1x por sessão (evitar chatice se recarregar logo a seguir)
        if (!sessionStorage.getItem("ws_theme_prompted")) {
          maybeAskTheme(me);
          sessionStorage.setItem("ws_theme_prompted", "1");
        }
      })
      .catch(() => { drop(); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  function maybeAskTheme(me: User) {
    const serverChoice = (me?.profile?.theme ?? null) as ThemeChoice | null;

    // conta nova: sem tema no perfil -> onboarding
    if (serverChoice == null) {
      setThemePrompt({ kind: "onboarding" });
      return;
    }

    // compara o tema aplicado vs. o do perfil
    const current = getCurrentResolved();           // "light" | "dark"
    const serverResolved = resolve(serverChoice);   // "light" | "dark"
    if (current !== serverResolved) {
      setThemePrompt({ kind: "mismatch", serverChoice });
    }
  }

  async function login(email: string, password: string) {
    const res = await apiPost<{ access: string; user: User }>("/auth/login", { email, password }, { softAuth: true });
    save(res.access); setToken(res.access); setUser(res.user);

    const override = getThemeOverride();
    if (!override) applyTheme((res.user.profile?.theme ?? "system") as any);

    // reset do “já perguntei”
    sessionStorage.removeItem("ws_theme_prompted");
    maybeAskTheme(res.user);
    sessionStorage.setItem("ws_theme_prompted", "1");
  }

  async function register(name: string, email: string, password: string) {
    const res = await apiPost<{ access: string; user: User }>("/auth/register", { displayName: name, email, password }, { softAuth: true });
    save(res.access); setToken(res.access); setUser(res.user);
  }
  async function refresh() {
    try {
      const me = await apiGet<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  function logout() { drop(); setToken(null); setUser(null); }

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, refresh, logout,
      themePrompt, setThemePrompt,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa do AuthProvider");
  return ctx;
}
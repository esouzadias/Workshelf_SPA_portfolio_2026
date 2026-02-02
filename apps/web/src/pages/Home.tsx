// pages/HomePage.tsx (trecho relevante)
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth.context";
import { useLanguage } from "../lib/locale.context";
import Dashboard from "../Components/Dashboard/Dashboard";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import { fetchApi } from "../lib/api";

type UserInfo = { displayName: string; role?: string; avatarUrl?: string | null };
type TabDef = { key: string; label: string };
type TilesByTab = Record<string, { category: string; description: string }[]>;

export default function HomePage() {
  const { user } = useAuth();
  const { activeLanguage } = useLanguage();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tabs, setTabs] = useState<TabDef[]>([]);
  const [tilesByTab, setTilesByTab] = useState<TilesByTab>({});

  const fallbackAvatar = useMemo(() => {
    const seed = user?.profile?.displayName || user?.email || "user";
    return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  }, [user?.profile?.displayName, user?.email]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const me = await fetchApi<{ email: string; profile?: any }>("/users/me");
      const p = me?.profile ?? {};
      setUserInfo({
        displayName: p.displayName || me.email || "User",
        role: p.currentTitle || p.employmentStatus || "",
        avatarUrl: p.avatarUrl || fallbackAvatar,
      });

      const dash = await fetchApi<{ tabs: TabDef[]; tilesByTab: TilesByTab }>("/dashboard");
      setTabs(dash.tabs);
      setTilesByTab(dash.tilesByTab);
    })();
  }, [user, fallbackAvatar]);

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: 64, color: "rgba(0,0,0,0.4)" }}>
        <NoAccountsIcon style={{ fontSize: 120, opacity: 0.2, color: "var(--primary)" }} />
        <p style={{ opacity: 0.2 }}>{activeLanguage.dictionary.notAuthenticated}.</p>
      </div>
    );
  }

  return (
    <div className="container">
    <main style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "20px", padding: "20px 0"}}>
        <h1>
          {activeLanguage.dictionary.welcome}, {(user.profile?.displayName || user.email || "").toUpperCase()}.
        </h1>
        <div className="container" style={{ maxWidth: 1100, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", alignItems: "center" }}>
          <Dashboard userInfo={userInfo} tabs={tabs} tilesByTab={tilesByTab} />
        </div>
      </main>
    </div>
  );
}
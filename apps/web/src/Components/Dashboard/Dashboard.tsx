import React, { useMemo, useState } from "react";
import "./Dashboard.styles.less";
import { Box } from "@mui/material";

import Sidebar from "../Sidebar/Sidebar";
import Tile from "../Tile/Tile";
import { ICON_MAP } from "../../lib/Icons";
import { useLanguage } from "../../lib/locale.context";
import DialogModal from "../DialogModal/DialogModal";
import DashboardProfile from "./QuickTileModals/DashboardProfile/DashboardProfile";
import { fetchApi } from "../../lib/api";
import DashboardCertifications from "./QuickTileModals/DashboardCertifications/DashboardCertifications";
import DashboardHighlights from "./QuickTileModals/DashboardHighlights/DashboardHighlights";
import DashboardTopSkills from "./QuickTileModals/DashboardTopSkills/DashboardTopSkills";
import DashboardProfessionalExperience from "./QuickTileModals/DashboardProfessionalExperience/DashboardProfessionalExperience";
import DashboardReviews from "./QuickTileModals/DashboardReview/DashboardReviews";
import DashboardPortfolio from "./Portfolio/DashboardPortfolio";
import DashboardContacts from "./Contacts/DashboardContacts";

/* ---------- Types ---------- */

export type DashboardUserInfo = {
  displayName: string;
  role?: string;
  avatarUrl?: string | null;
};

type TabDef = { key: string; label: string; icon?: string | null };
type TileDef = { category: string | { t: string }; description: string; icon?: string | null };
type TilesByTab = Record<string, TileDef[]>;

type DashboardProps = {
  userInfo: DashboardUserInfo | null;
  tabs: TabDef[];
  tilesByTab: TilesByTab;
};

const Dashboard: React.FC<DashboardProps> = ({ userInfo, tabs, tilesByTab }) => {
  const [tab, setTab] = useState<string>(tabs[0]?.key || "overview");
  const tiles = tilesByTab[tab] || [];
  const { activeLanguage } = useLanguage();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentModal, setCurrentModal] = useState<any>(null);
  const [me, setMe] = useState<any>(null);

  React.useEffect(() => {
    fetchApi("/users/me")
      .then((data: any) => setMe(data))
      .catch(() => { });
  }, []);


  const pickKey = useMemo(
    () => (v: unknown): string =>
      typeof v === "string"
        ? v
        : v && typeof v === "object" && typeof (v as any).t === "string"
          ? (v as any).t
          : "",
    []
  );

  const tDict = useMemo(
    () => (key: string): string => {
      const d = activeLanguage?.dictionary as any;
      return d?.[key] ?? d?.categories?.[key] ?? key;
    },
    [activeLanguage]
  );

  // Get description from dictionary from the correct language, fallback to raw text
  const tDescription = useMemo(
    () => (key: string): string => {
      const d = activeLanguage?.dictionary as any;
      return d?.[key] ?? d?.descriptions?.[key] ?? key;
    },
    [activeLanguage]
  );

  const sidebarItems = useMemo(
    () =>
      tabs.map(t => ({
        value: t.key,
        label: tDict(t.label),
        icon: t.icon && ICON_MAP[t.icon]
          ? React.createElement(ICON_MAP[t.icon], { fontSize: "small" })
          : undefined,
      })),
    [tabs, tDict]
  );

  const renderModal = (modal: any) => {
    const t = tiles.find(tile => pickKey(tile.category) === modal);
    if (!t) return "null";
    const handleClose = () => setOpenModal(false);
    setOpenModal(true);

    setCurrentModal(
      <DialogModal
        content={
          modal === "profile" ? (
            <DashboardProfile
              open={true}
              onClose={handleClose}
              title={tDict(pickKey(t.category))}
              profile={(me as any)?.profile ?? {}} />
          ) : modal === "latestCertificates" ? (
            <DashboardCertifications
            />
          ) : modal === "highlights" ? (
            <DashboardHighlights
            />
          ) : modal === "topSkills" ? (
            <DashboardTopSkills
            />
          ) : modal === "professionalExperience" ? (
            <DashboardProfessionalExperience
            />
          ) : modal == "latestReviews" ? (
            <DashboardReviews />
          ) : (
            <div></div>
          )
        }
        title={[t.icon ? <img src={t.icon} style={{ height: 30, verticalAlign: "middle" }} alt="topSkillsIcon" /> : null, tDict(pickKey(t.category))]}
        open={true}
        onClose={handleClose}
      />

    );

  };

  return (
    <main id="dashboard">
      <section id="sidebar">
        <Sidebar
          avatarUrl={userInfo?.avatarUrl}
          title={userInfo?.displayName}
          subtitle={userInfo?.role}
          items={sidebarItems}
          value={tab}
          onChange={setTab}
        />
      </section>

      <section className="dash-content fade-slide">
        {tab === "portfolio" ? (
          <DashboardPortfolio />
        ) : tab === "contacts" ? <DashboardContacts /> : (
          <Box className="tile-grid">
            {tiles.map((t, i) => (
              <Tile
                key={`${tab}-${i}`}
                title={tDict(pickKey(t.category))}
                subtitle={tDescription(t.description)}
                icon={t.icon}
                onClick={() => renderModal(pickKey(t.category))}
              />
            ))}
          </Box>
        )}
      </section>

      {openModal && currentModal && (
        <div>{currentModal}</div>
      )}
    </main>
  );
};

export default Dashboard;
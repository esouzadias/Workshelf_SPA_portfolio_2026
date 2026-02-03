import React from "react";
import { Avatar, Box, Tabs, Tab, Typography } from "@mui/material";
import type { DashboardUserInfo } from "./Dashboard";
import "./Dashboard.styles.less";

type Item = { value: string; label: string; icon?: React.ReactElement };

type Props = {
  userInfo: DashboardUserInfo | null;
  items: Item[];
  tab: string;
  setTab: (v: string) => void;
  renderContent: () => React.ReactNode;
};

export default function DashboardMobile({ userInfo, items, tab, setTab, renderContent }: Props) {
  return (
    <main id="dashboard-mobile">
      <Box className="dashm-head">
        <Avatar src={userInfo?.avatarUrl || undefined} sx={{ width: 44, height: 44 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
            {userInfo?.displayName || "—"}
          </Typography>
          {userInfo?.role ? (
            <Typography sx={{ opacity: 0.6, fontWeight: 800, fontSize: 12.5 }}>
              {userInfo.role}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box className="dashm-tabs">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(String(v))}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          {items.map((it) => (
            <Tab
              key={it.value}
              value={it.value}
              label={it.label as any}
              icon={it.icon}
              iconPosition={it.icon ? "start" : undefined}
              disableRipple
              className={`dashm-tab ${tab === it.value ? "is-active" : ""}`}
            />
          ))}
        </Tabs>
      </Box>

      <section className="dashm-content fade-slide">{renderContent()}</section>
    </main>
  );
}
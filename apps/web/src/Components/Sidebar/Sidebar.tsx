// apps/web/src/Components/Sidebar/Sidebar.tsx
import React from "react";
import { Paper, Stack, Avatar, Box, Typography, Divider } from "@mui/material";
import VerticalBlobTabs from "../VerticalBlobTabs/VerticalBlobTabs";
import "./Sidebar.styles.less";

type TabItem = { value: string; label: string; icon?: React.ReactNode };

type SidebarProps = {
  avatarUrl?: string | null;
  title?: string;
  subtitle?: string;
  items: readonly TabItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

const Sidebar: React.FC<SidebarProps> = ({
  avatarUrl,
  title,
  subtitle,
  items,
  value,
  onChange,
  className,
}) => (
  <main id="sidebar-main">
    <Paper elevation={0} className={`sidebar sticky ${className || ""}`}>
      <Stack spacing={2} alignItems="center" className="sidebar-header">
        <Avatar src={avatarUrl || undefined} sx={{ width: 72, height: 72 }} />
        <Box className="center">
          <Typography variant="h6" className="name">{title || "—"}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="var(--primary)" style={{ opacity: 0.3, fontWeight: "lighter" }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Divider className="divider" />

      <VerticalBlobTabs
        items={items as any}
        value={value}
        onChange={(v: unknown) => onChange(String(v))}
        className="vtabs"
      />
    </Paper>
  </main>
);

export default Sidebar;
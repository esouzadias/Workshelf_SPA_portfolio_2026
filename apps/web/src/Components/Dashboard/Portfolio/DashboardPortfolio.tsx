// apps/web/src/Components/Dashboard/Portfolio/DashboardPortfolio.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

const GITHUB_USER = "esouzadias";
const PAGE_SIZE = 8;

const toDateLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

const pillButtonSx = {
  appearance: "none",
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.04)",
  color: "inherit",
  borderRadius: 999,
  px: 1.1,
  py: 0.55,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.55,
  fontWeight: 900,
  textDecoration: "none",
  transition: "background 140ms ease, transform 140ms ease, opacity 140ms ease",
  "&:hover": { background: "rgba(255,255,255,.06)", transform: "translateY(-1px)" },
  "&:active": { transform: "translateY(0px) scale(.99)" },
  "&:disabled": { opacity: 0.4, cursor: "not-allowed" as const, transform: "none" },
};

const DashboardPortfolio: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!res.ok) throw new Error(`GitHub ${res.status}`);

        const data = (await res.json()) as Repo[];
        if (!cancelled) setRepos(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const all = useMemo(
    () =>
      repos
        .filter(r => !r.private && !r.fork && !r.archived)
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()),
    [repos]
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(all.length / PAGE_SIZE)), [all.length]);

  useEffect(() => {
    // se reduzir repos/filtrar e a página ficar inválida, corrige
    setPage(p => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  }, [all, page]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
        boxShadow: "0 0 18px rgba(0,0,0,.28)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <GitHubIcon />
          <Typography sx={{ fontWeight: 900 }}>Portfolio</Typography>
          <Typography sx={{ opacity: 0.6, fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
            @{GITHUB_USER}
          </Typography>
        </Box>

        <Box
          component="a"
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noreferrer"
          sx={pillButtonSx}
        >
          <OpenInNewRoundedIcon fontSize="small" />
          Open GitHub
        </Box>
      </Box>

      {/* Pagination bar */}
      {!loading && !error && all.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.25,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ opacity: 0.7, fontWeight: 800, fontSize: 13 }}>
            {all.length} repos · page {page}/{totalPages}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.8, alignItems: "center" }}>
            <Box
              component="button"
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              sx={pillButtonSx}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
              Prev
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              sx={pillButtonSx}
            >
              Next
              <ChevronRightRoundedIcon fontSize="small" />
            </Box>
          </Box>
        </Box>
      )}

      {/* Content */}
      {loading ? (
        <Typography sx={{ opacity: 0.7, fontWeight: 800 }}>Loading repositories…</Typography>
      ) : error ? (
        <Typography sx={{ opacity: 0.7, fontWeight: 800 }}>Failed to load repositories</Typography>
      ) : all.length === 0 ? (
        <Typography sx={{ opacity: 0.7, fontWeight: 800 }}>No public repositories found</Typography>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            display: "grid",
            gap: 1.25,
            overflowY: "auto",
            paddingRight: 0.5,
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            "@media (max-width: 600px)": { gridTemplateColumns: "1fr" },
          }}
        >
          {pageItems.map(r => (
            <Box
              key={r.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.6,
                p: 1.35,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.14)",
                boxShadow: "0 0 10px rgba(0,0,0,.18)",
                minWidth: 0,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "baseline" }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.name}
                </Typography>
                <Typography sx={{ opacity: 0.6, fontSize: 12, whiteSpace: "nowrap" }}>
                  {toDateLabel(r.pushed_at)}
                </Typography>
              </Box>

              <Typography
                sx={{
                  opacity: 0.75,
                  fontSize: 13,
                  lineHeight: 1.45,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {r.description || "No description"}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto", gap: 1 }}>
                <Typography sx={{ opacity: 0.6, fontSize: 12, whiteSpace: "nowrap" }}>
                  {r.language || "—"} · ★ {r.stargazers_count} · ⑂ {r.forks_count}
                </Typography>

                <Box
                  component="a"
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  sx={pillButtonSx}
                >
                  <OpenInNewRoundedIcon fontSize="inherit" />
                  Repo
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DashboardPortfolio;
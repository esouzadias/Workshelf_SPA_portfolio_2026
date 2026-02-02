import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarHalfRoundedIcon from "@mui/icons-material/StarHalfRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";

type Skill = { id?: string; name: string; proficiency: number; icon?: string | null };
type Cert = { id: string; title: string; fileName: string; url: string; badgeColor?: string | null; iconUrl?: string | null };

const API = "http://localhost:4000";
const resolveUrl = (u: string) => (u?.startsWith("/uploads") ? `${API}${u}` : u);

const MAX_STARS = 5;
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const pctToStars = (pct: number) => {
  const value = (clamp(pct) / 100) * MAX_STARS;
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  return { full, half, empty: MAX_STARS - full - half };
};
const norm = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  interface DashboardTopSkillsProps {
    
  }

const DashboardTopSkills: React.FC<DashboardTopSkillsProps> = ({}) => {
  const { activeLanguage } = useLanguage();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [visible, setVisible] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const dict: any = activeLanguage?.dictionary ?? {};
  const categories = dict?.categories ?? {};
  const descriptions = dict?.descriptions ?? {};

  const relatedTitle =
    descriptions?.dRelatedCertifications ??
    categories?.relatedCertifications ??
    "Related certificates";

  const closeText = dict?.close ?? "Close";
  const showMoreText = dict?.showMore ?? "Show more";
  const showLessText = dict?.showLess ?? "Show less";

  useEffect(() => {
    fetchApi("/users/me")
      .then((me: any) => fetchApi(`/api/profile/${me?.profile?.id}/skills`))
      .then((data) => Array.isArray(data) && setSkills(data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchApi("/dashboard/certifications")
      .then((data) => Array.isArray(data) && setCerts(data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sorted = useMemo(
    () =>
      [...(skills ?? [])]
        .filter((s) => String(s?.name ?? "").trim().length > 0)
        .sort((a, b) => clamp(Number(b?.proficiency ?? 0)) - clamp(Number(a?.proficiency ?? 0))),
    [skills]
  );

  const shown = useMemo(() => (expanded ? sorted : sorted.slice(0, 5)), [expanded, sorted]);
  const hasMore = sorted.length > 5;

  const getKey = (s: Skill, idx: number) => (s.id ? `id:${s.id}` : `idx:${idx}:${norm(s.name)}`);

  const matchesForSkill = (skillName: string) => {
    const nSkill = norm(skillName);
    if (!nSkill) return [];
    const words = nSkill.split(" ").filter((w) => w.length >= 3);

    return (certs ?? [])
      .map((c) => {
        const t = norm(c.title);
        let score = 0;
        if (t.includes(nSkill)) score += 5;
        for (const w of words) if (t.includes(w)) score += 1;
        return { cert: c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cert);
  };

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "relative",
        p: 1.5,
        background: "transparent",
        border: "none",
        boxShadow: "none",

        "@keyframes tsIn": {
          "0%": { opacity: 0, transform: "translateY(10px) scale(.985)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "@keyframes starPulse": {
          "0%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.25)", filter: "brightness(1.3)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        "@keyframes tsSheen": {
          "0%": { transform: "translateX(-70%) rotate(12deg)" },
          "100%": { transform: "translateX(170%) rotate(12deg)" },
        },
      }}
    >
      {/* LIST */}
      <Box
        sx={{
          display: "grid",
          gap: 1.25,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Scrollable skills list wrapper */}
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            maxHeight: expanded ? "60vh" : "none",
            overflowY: expanded ? "auto" : "visible",
            pr: expanded ? 1 : 0, // add a little padding for scrollbar
            transition: "max-height 0.3s cubic-bezier(.2,.9,.2,1)",
          }}
        >
          {shown.map((skill, idx) => {
            const key = getKey(skill, idx);
            const pct = clamp(Number(skill.proficiency ?? 0));
            const { full, half, empty } = pctToStars(pct);
            const isOpen = openKey === key;

            const related = isOpen ? matchesForSkill(skill.name).slice(0, 4) : [];

            return (
              <Box key={key} sx={{ display: "grid", gap: 1 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setOpenKey((cur) => (cur === key ? null : key))}
                  sx={{
                    appearance: "none",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",

                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 2,

                    p: 1.35,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: isOpen
                      ? "linear-gradient(135deg, rgba(99,102,241,.14), rgba(236,72,153,.08), rgba(34,211,238,.06))"
                      : "rgba(255,255,255,.035)",
                    boxShadow: isOpen ? "0 0 14px rgba(0,0,0,.36)" : "0 0 6px rgba(0,0,0,.22)",
                    position: "relative",
                    overflow: "hidden",

                    opacity: visible ? 1 : 0,
                    animation: visible ? `tsIn 420ms cubic-bezier(.2,.9,.2,1) ${idx * 70}ms both` : "none",
                    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",

                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: -40,
                      background: "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.16) 18%, transparent 36%)",
                      opacity: 0,
                      transform: "translateX(-70%) rotate(12deg)",
                      pointerEvents: "none",
                    },

                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 16px rgba(0,0,0,.40)",
                      borderColor: "rgba(255,255,255,.18)",
                      "&::after": { opacity: 0.24, animation: "tsSheen 900ms ease both" },
                      "& .ts-star": { animation: "starPulse 520ms cubic-bezier(.2,.9,.2,1)" },
                    },
                    "&:active": { transform: "translateY(-1px) scale(.995)" },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      letterSpacing: ".2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      opacity: isOpen ? 0.98 : 0.88,
                    }}
                  >
                    {skill.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 0.25, alignItems: "center" }}>
                    {Array.from({ length: full }).map((_, i) => (
                      <StarRoundedIcon key={`f-${i}`} className="ts-star" fontSize="small" sx={{ color: "#facc15" }} />
                    ))}
                    {half === 1 && <StarHalfRoundedIcon className="ts-star" fontSize="small" sx={{ color: "#facc15" }} />}
                    {Array.from({ length: empty }).map((_, i) => (
                      <StarOutlineRoundedIcon key={`e-${i}`} fontSize="small" sx={{ opacity: 0.35 }} />
                    ))}
                  </Box>
                </Box>

                {/* EXPAND */}
                <Collapse in={isOpen} timeout={220}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(0,0,0,.16)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      p: 1.25,
                      boxShadow: "0 0 10px rgba(0,0,0,.26)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 1 }}>
                      <Typography sx={{ fontWeight: 900, opacity: 0.9 }}>{pct}%</Typography>
                      <Typography sx={{ opacity: 0.72, fontWeight: 800 }}>{full + half * 0.5}/{MAX_STARS}</Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 900, opacity: 0.85, mb: 0.75 }}>
                      {relatedTitle}
                    </Typography>

                    {related.length === 0 ? (
                      <Typography sx={{ opacity: 0.65, fontSize: 13 }}>
                        {dict?.noCertifications ?? "No certifications added"}
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {related.map((c) => (
                          <Box
                            key={c.id}
                            component="button"
                            type="button"
                            onClick={() => setPreview({ title: c.title, url: resolveUrl(c.url) })}
                            sx={{
                              appearance: "none",
                              border: "1px solid rgba(255,255,255,.12)",
                              background: "rgba(255,255,255,.04)",
                              color: "rgba(255,255,255,.86)",
                              borderRadius: 999,
                              px: 1.2,
                              py: 0.65,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              maxWidth: "100%",
                              transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
                              boxShadow: "0 0 6px rgba(0,0,0,.18)",
                              "&:hover": {
                                transform: "translateY(-1px)",
                                borderColor: "rgba(255,255,255,.18)",
                                boxShadow: "0 0 12px rgba(0,0,0,.26)",
                                background: "rgba(255,255,255,.06)",
                              },
                              "&:active": { transform: "translateY(0px) scale(.99)" },
                            }}
                          >
                            <PictureAsPdfRoundedIcon fontSize="small" sx={{ opacity: 0.9 }} />
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: 12.5,
                                opacity: 0.9,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 240,
                              }}
                            >
                              {c.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* inline PDF preview (no nested modal) */}
                    {preview && (
                      <Box sx={{ mt: 1.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
                          <Typography sx={{ fontWeight: 900, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {preview.title}
                          </Typography>
                          <Box
                            component="button"
                            type="button"
                            onClick={() => setPreview(null)}
                            sx={{
                              appearance: "none",
                              border: "1px solid rgba(255,255,255,.12)",
                              background: "rgba(255,255,255,.04)",
                              color: "var(--linkColor)",
                              borderRadius: 999,
                              px: 1.1,
                              py: 0.45,
                              cursor: "pointer",
                              fontWeight: 900,
                              opacity: 0.9,
                              transition: "transform 140ms ease, opacity 140ms ease",
                              "&:hover": { opacity: 1, transform: "translateY(-1px)" },
                              "&:active": { transform: "scale(.99)" },
                            }}
                          >
                            {closeText}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            height: 380,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,.10)",
                            background: "rgba(0,0,0,.22)",
                          }}
                        >
                          <embed src={preview.url} type="application/pdf" width="100%" height="100%" />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}

        </Box>
        {hasMore && (
          <Box
            component="button"
            type="button"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              justifySelf: "start",
              mt: 0.25,
              appearance: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: "var(--linkColor)",
              fontWeight: 900,
              letterSpacing: ".2px",
              opacity: expanded ? 0.9 : 0.78,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              transition: "opacity 160ms ease, transform 160ms ease, color 160ms ease",
              "&:hover": { opacity: 1, transform: "translateY(-1px)", color: "var(--linkColor)" },
              "&:active": { transform: "translateY(0px) scale(.99)" },
            }}
          >
            {expanded ? showLessText : showMoreText}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DashboardTopSkills;
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";
import { useAuth } from "../../../../lib/auth.context";

type ExperienceTask = { id: string; text: string; order: number };

type Technology = { id: string; name: string; iconUrl?: string | null };
type ExperienceTechnology = { experienceId: string; technologyId: string; technology: Technology };

type Experience = {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;

  isConsultancy?: boolean;
  client?: string | null;
  clientLogoUrl?: string | null;

  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;

  description?: string | null;
  tasks: ExperienceTask[];
  techLinks: ExperienceTechnology[];
};

type TechItem = { name: string; iconUrl?: string | null };

const norm = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const initials = (name: string) => {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
};

const hashColor = (s: string) => {
  const str = norm(s);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 65% 55%)`;
};

const formatMonthYear = (iso: string | null | undefined, locale: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(d);
};

const diffLabel = (startIso: string, endIso: string | null | undefined) => {
  const s = new Date(startIso);
  const e = endIso ? new Date(endIso) : new Date();
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const m = Math.max(0, months);
  if (m < 12) return `${m} mo`;
  return `${(m / 12).toFixed(1)} yrs`;
};

const countMatches = (text: string, q: string) => {
  const t = String(text ?? "");
  const query = String(q ?? "").trim();
  if (!query) return 0;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc, "ig");
  const hits = t.match(re);
  return hits?.length ?? 0;
};

const highlightTech = (text: string, tech: string) => {
  const t = String(text ?? "");
  const q = String(tech ?? "").trim();
  if (!q) return t;

  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${esc})`, "ig");
  const parts = t.split(re);

  return (
    <>
      {parts.map((p, i) => {
        const isHit = p.toLowerCase() === q.toLowerCase();
        return (
          <Box
            key={i}
            component="span"
            sx={
              isHit
                ? {
                    fontWeight: 1000,
                    color: "rgba(255,255,255,.94)",
                    textShadow: "0 0 14px rgba(99,102,241,.35)",
                    background: "rgba(99,102,241,.14)",
                    borderRadius: 6,
                    px: 0.35,
                    py: 0.05,
                  }
                : {}
            }
          >
            {p}
          </Box>
        );
      })}
    </>
  );
};

const LogoDot = ({ src, alt, size = 24 }: { src?: string | null; alt: string; size?: number }) => {
  const s = String(src ?? "").trim();
  if (s) {
    return (
      <Box
        component="img"
        src={s}
        alt={alt}
        sx={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,.14)",
          boxShadow: "0 0 10px rgba(0,0,0,.22)",
          flex: "0 0 auto",
        }}
      />
    );
  }

  const bg = hashColor(alt);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        fontWeight: 1000,
        fontSize: Math.max(11, Math.floor(size * 0.45)),
        color: "rgba(255,255,255,.92)",
        background: `linear-gradient(135deg, ${bg}, rgba(255,255,255,.10))`,
        border: "1px solid rgba(255,255,255,.14)",
        boxShadow: "0 0 10px rgba(0,0,0,.22)",
        flex: "0 0 auto",
      }}
    >
      {initials(alt)}
    </Box>
  );
};

const TechIcon = ({ name, iconUrl, size = 16 }: { name: string; iconUrl?: string | null; size?: number }) => {
  const s = String(iconUrl ?? "").trim();
  if (s) {
    return (
      <Box
        component="img"
        src={s}
        alt={name}
        sx={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,.16)",
          boxShadow: "0 0 8px rgba(0,0,0,.20)",
          flex: "0 0 auto",
        }}
      />
    );
  }

  const bg = hashColor(name);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        fontWeight: 1000,
        fontSize: Math.max(9, Math.floor(size * 0.55)),
        color: "rgba(255,255,255,.92)",
        background: `linear-gradient(135deg, ${bg}, rgba(255,255,255,.12))`,
        border: "1px solid rgba(255,255,255,.14)",
        flex: "0 0 auto",
      }}
    >
      {initials(name)}
    </Box>
  );
};

const TechStackPreview = ({ techs }: { techs: TechItem[] }) => {
  const shown = techs.slice(0, 6);
  const rest = Math.max(0, techs.length - shown.length);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", opacity: 0.9 }}>
      {shown.map((t) => (
        <Box
          key={norm(t.name)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.45,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
            px: 0.75,
            py: 0.35,
            boxShadow: "0 0 10px rgba(0,0,0,.18)",
          }}
        >
          <TechIcon name={t.name} iconUrl={t.iconUrl} size={16} />
          <Typography sx={{ fontWeight: 1000, fontSize: 12.25, opacity: 0.9, maxWidth: 120 }} noWrap>
            {t.name}
          </Typography>
        </Box>
      ))}

      {rest > 0 && (
        <Box
          sx={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.03)",
            px: 0.9,
            py: 0.45,
            fontWeight: 1000,
            fontSize: 12.25,
            color: "rgba(255,255,255,.85)",
          }}
        >
          +{rest}
        </Box>
      )}
    </Box>
  );
};

const TechOrbit = ({
  techs,
  active,
  onPick,
  resetLabel,
}: {
  techs: TechItem[];
  active: string | null;
  onPick: (name: string | null) => void;
  resetLabel: string;
}) => {
  const list = useMemo(() => {
    const m = new Map<string, TechItem>();
    for (const t of techs ?? []) {
      const k = norm(t?.name);
      if (!k) continue;
      if (!m.has(k)) m.set(k, t);
    }
    return Array.from(m.values());
  }, [techs]);

  const n = list.length;

  const radius = n <= 5 ? 52 : n <= 8 ? 62 : n <= 12 ? 72 : 82;
  const size = radius * 2 + 86;
  const spin = n > 1;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 220,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(0,0,0,.14)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 0 10px rgba(0,0,0,.22)",
        overflow: "visible",
        px: 1.1,
        py: 1.1,

        "@keyframes orbitSpin": {
          "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
        },
        "@keyframes orbitSpinReverse": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        "@keyframes bubbleFloat": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-3px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "@keyframes corePulse": {
          "0%": { transform: "translate(-50%, -50%) scale(1)", filter: "brightness(1)" },
          "55%": { transform: "translate(-50%, -50%) scale(1.06)", filter: "brightness(1.12)" },
          "100%": { transform: "translate(-50%, -50%) scale(1)", filter: "brightness(1)" },
        },

        "&:hover .orbit-rotor": { animationPlayState: "paused" },
        "&:hover .orbit-upright": { animationPlayState: "paused" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          borderRadius: 999,
          border: "1px dashed rgba(255,255,255,.16)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,.20)",
          opacity: 0.65,
          pointerEvents: "none",
        }}
      />

      <Box
        component="button"
        type="button"
        onClick={() => onPick(null)}
        title={resetLabel}
        sx={{
          appearance: "none",
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 64,
          height: 64,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.16)",
          background: "linear-gradient(135deg, rgba(99,102,241,.26), rgba(236,72,153,.14), rgba(34,211,238,.10))",
          boxShadow: "0 0 20px rgba(0,0,0,.35)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,.92)",
          animation: "corePulse 1800ms ease-in-out infinite",
          "&:hover": { filter: "brightness(1.08)" },
          "&:active": { transform: "translate(-50%, -50%) scale(0.99)" },
        }}
      >
        <LabelRoundedIcon sx={{ opacity: 0.9 }} />
      </Box>

      <Box
        className="orbit-rotor"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: radius * 2,
          height: radius * 2,
          transform: "translate(-50%, -50%)",
          animation: spin ? "orbitSpin 14s linear infinite" : "none",
          transformOrigin: "center center",
        }}
      >
        {list.slice(0, 14).map((t, i) => {
          const angle = (Math.PI * 2 * i) / Math.max(1, Math.min(14, n));
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = !!active && norm(active) === norm(t.name);

          return (
            <Box
              key={`${norm(t.name)}:${i}`}
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <Box
                className="orbit-upright"
                sx={{
                  animation: spin ? "orbitSpinReverse 14s linear infinite" : "none",
                  transformOrigin: "center center",
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick(isActive ? null : t.name);
                  }}
                  title={t.name}
                  sx={{
                    appearance: "none",
                    cursor: "pointer",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,.14)",
                    background: isActive ? "rgba(99,102,241,.26)" : "rgba(255,255,255,.06)",
                    color: "rgba(255,255,255,.90)",
                    px: 0.95,
                    py: 0.6,
                    boxShadow: isActive ? "0 0 18px rgba(99,102,241,.30)" : "0 0 10px rgba(0,0,0,.22)",
                    fontWeight: 1000,
                    fontSize: 12.25,
                    maxWidth: 170,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    animation: `bubbleFloat 1700ms ease-in-out ${i * 90}ms infinite`,
                    transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease",
                    "&:hover": {
                      transform: "scale(1.10)",
                      borderColor: "rgba(255,255,255,.22)",
                      boxShadow: "0 0 18px rgba(0,0,0,.28)",
                    },
                    "&:active": { transform: "scale(1.06)" },
                  }}
                >
                  <TechIcon name={t.name} iconUrl={t.iconUrl} size={18} />
                  <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.name}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: -30,
          background:
            "radial-gradient(520px circle at 15% 10%, rgba(99,102,241,.14), transparent 55%), radial-gradient(480px circle at 90% 45%, rgba(236,72,153,.10), transparent 60%)",
          opacity: 0.65,
        }}
      />
    </Box>
  );
};

type TStrings = {
  hint: string;
  showMore: string;
  showLess: string;
  current: string;
  noExperience: string;
  techFocus: string;
  clickToFocus: string;
  reset: string;
  matches: string;
  tasks: string;
};

const useAutoScrollToggle = ({
  containerRef,
  deps,
  maxHeight = 620,
}: {
  containerRef: React.RefObject<HTMLElement>;
  deps: any[];
  maxHeight?: number;
}) => {
  const [scrollOn, setScrollOn] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const check = () => {
      const should = el.scrollHeight > maxHeight + 2;
      setScrollOn(should);
    };

    check();

    const ro = new ResizeObserver(() => check());
    ro.observe(el);

    window.addEventListener("resize", check, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [containerRef, maxHeight, ...deps]);

  return scrollOn;
};

const ExperienceRow = ({
  exp,
  idx,
  visible,
  locale,
  isOpen,
  open,
  close,
  activeTech,
  setActiveTech,
  t,
}: {
  exp: Experience;
  idx: number;
  visible: boolean;
  locale: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  activeTech: string | null;
  setActiveTech: (v: string | null) => void;
  t: TStrings;
}) => {
  const start = formatMonthYear(exp.startDate, locale);
  const end = exp.isCurrent ? t.current : formatMonthYear(exp.endDate ?? null, locale);
  const range = [start, end].filter(Boolean).join(" — ");
  const dur = diffLabel(exp.startDate, exp.isCurrent ? null : exp.endDate ?? null);

  const tasks = useMemo(
    () => (exp.tasks ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [exp.tasks]
  );

  const techItems = useMemo<TechItem[]>(() => {
    const m = new Map<string, TechItem>();
    for (const l of exp.techLinks ?? []) {
      const name = l?.technology?.name;
      if (!name) continue;
      const k = norm(name);
      if (!k) continue;
      if (!m.has(k)) m.set(k, { name, iconUrl: l?.technology?.iconUrl ?? null });
    }
    return Array.from(m.values());
  }, [exp.techLinks]);

  const filteredTasks = useMemo(() => {
    if (!activeTech) return tasks;
    return tasks.filter((tItem) => countMatches(tItem.text, activeTech) > 0);
  }, [tasks, activeTech]);

  const descMatchCount = useMemo(
    () => (activeTech ? countMatches(exp.description ?? "", activeTech) : 0),
    [exp.description, activeTech]
  );

  const taskMatchCount = useMemo(() => {
    if (!activeTech) return 0;
    return tasks.reduce((acc, tItem) => acc + countMatches(tItem.text, activeTech), 0);
  }, [tasks, activeTech]);

  const activeIconUrl = useMemo(() => {
    if (!activeTech) return null;
    return techItems.find((x) => norm(x.name) === norm(activeTech))?.iconUrl ?? null;
  }, [techItems, activeTech]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "26px 1fr",
        gap: 1.25,
        alignItems: "start",
        opacity: visible ? 1 : 0,
        animation: visible ? `peIn 420ms cubic-bezier(.2,.9,.2,1) ${idx * 70}ms both` : "none",
      }}
    >
      <Box sx={{ position: "relative", height: "100%", display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: 999,
            mt: "14px",
            background: exp.isCurrent
              ? "linear-gradient(135deg, rgba(99,102,241,.85), rgba(236,72,153,.55), rgba(34,211,238,.45))"
              : "rgba(255,255,255,.22)",
            boxShadow: exp.isCurrent ? "0 0 14px rgba(99,102,241,.35)" : "0 0 10px rgba(0,0,0,.25)",
            border: "1px solid rgba(255,255,255,.18)",
            position: "relative",
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 24,
            bottom: 0,
            width: 2,
            borderRadius: 999,
            background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04))",
            opacity: 0.65,
          }}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 1 }}>
        <Box
          component="button"
          type="button"
          onClick={() => {
            if (isOpen) close();
            else open();
          }}
          sx={{
            appearance: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,.10)",
            background: isOpen
              ? "linear-gradient(135deg, rgba(99,102,241,.14), rgba(236,72,153,.08), rgba(34,211,238,.06))"
              : "rgba(255,255,255,.035)",
            boxShadow: isOpen ? "0 0 14px rgba(0,0,0,.36)" : "0 0 6px rgba(0,0,0,.22)",
            p: 1.35,
            position: "relative",
            overflow: "hidden",
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
              "&::after": { opacity: 0.24, animation: "peSheen 900ms ease both" },
            },
            "&:active": { transform: "translateY(-1px) scale(.995)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5 }}>
            <Typography
              sx={{
                fontWeight: 1000,
                letterSpacing: ".2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                opacity: isOpen ? 0.98 : 0.9,
              }}
            >
              {exp.title}
            </Typography>

            <Typography sx={{ fontWeight: 900, opacity: 0.75, flex: "0 0 auto" }}>
              {range}
              {dur ? ` · ${dur}` : ""}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 0.85, mt: 0.9 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.1, alignItems: "center", opacity: 0.94 }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
                <LogoDot src={exp.companyLogoUrl ?? null} alt={exp.company} />
                <Typography sx={{ fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {exp.company}
                </Typography>
              </Box>

              {!!exp.isConsultancy && !!exp.client && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, minWidth: 0, opacity: 0.92 }}>
                  <Typography sx={{ fontWeight: 1000, opacity: 0.55 }}>→</Typography>
                  <LogoDot src={exp.clientLogoUrl ?? null} alt={exp.client} />
                  <Typography sx={{ fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {exp.client}
                  </Typography>
                </Box>
              )}
            </Box>

            {techItems.length > 0 && (
              <Box sx={{ display: "grid", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 900, opacity: 0.62, fontSize: 12.5 }}>{t.clickToFocus}</Typography>
                <TechStackPreview techs={techItems} />
              </Box>
            )}

            {exp.isCurrent && (
              <Box
                sx={{
                  mt: 0.25,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  borderRadius: 999,
                  px: 1.0,
                  py: 0.4,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  width: "fit-content",
                }}
              >
                <CalendarMonthRoundedIcon fontSize="small" sx={{ opacity: 0.8, color: "var(--primary)" }} />
                <Typography sx={{ fontWeight: 1000, fontSize: 12.5, opacity: 0.9 }}>{t.current}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Collapse in={isOpen} timeout={240}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(0,0,0,.16)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 0 10px rgba(0,0,0,.26)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 1.35,
                display: "grid",
                gap: 1.1,
                maxHeight: 520,
                overflowY: "auto",
              }}
            >
              {techItems.length > 0 && (
                <Box sx={{ display: "grid", gap: 0.85 }}>
                  <Typography sx={{ fontWeight: 1000, opacity: 0.88 }}>{t.techFocus}</Typography>

                  <TechOrbit techs={techItems} active={activeTech} onPick={(name) => setActiveTech(name)} resetLabel={t.reset} />
                </Box>
              )}

              {activeTech && (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(99,102,241,.10)",
                    px: 1.1,
                    py: 0.85,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.85,
                    boxShadow: "0 0 14px rgba(99,102,241,.18)",
                  }}
                >
                  <TechIcon name={activeTech} iconUrl={activeIconUrl} size={18} />
                  <Typography sx={{ fontWeight: 1000, opacity: 0.92, fontSize: 13 }}>{activeTech}</Typography>

                  <Typography sx={{ fontWeight: 900, opacity: 0.75, fontSize: 12.5 }}>
                    · {descMatchCount + taskMatchCount} {t.matches}
                  </Typography>

                  <Typography sx={{ fontWeight: 900, opacity: 0.75, fontSize: 12.5 }}>
                    · {filteredTasks.length}/{tasks.length} {t.tasks}
                  </Typography>

                  <Box sx={{ flex: 1 }} />

                  <Box
                    component="button"
                    type="button"
                    onClick={() => setActiveTech(null)}
                    sx={{
                      appearance: "none",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      color: "rgba(255,255,255,.90)",
                      fontWeight: 1000,
                      "&:hover": { opacity: 1, textDecoration: "underline", textUnderlineOffset: "3px" },
                    }}
                  >
                    {t.reset}
                  </Box>
                </Box>
              )}

              {exp.description && (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(255,255,255,.03)",
                    px: 1.05,
                    py: 0.95,
                  }}
                >
                  <Typography sx={{ opacity: 0.9, fontWeight: 900 }}>
                    {activeTech ? highlightTech(exp.description, activeTech) : exp.description}
                  </Typography>
                </Box>
              )}

              {filteredTasks.length > 0 && (
                <Box sx={{ display: "grid", gap: 0.55 }}>
                  {filteredTasks.slice(0, 8).map((tItem) => (
                    <Box
                      key={tItem.id}
                      sx={{
                        borderRadius: 1.75,
                        border: "1px solid rgba(255,255,255,.10)",
                        background: activeTech ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.03)",
                        px: 1,
                        py: 0.75,
                        transition: "background 160ms ease, border-color 160ms ease",
                      }}
                    >
                      <Typography sx={{ fontWeight: 850, opacity: 0.9, fontSize: 13.25 }}>
                        • {activeTech ? highlightTech(tItem.text, activeTech) : tItem.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {activeTech && filteredTasks.length === 0 && (
                <Typography sx={{ opacity: 0.72, fontWeight: 900 }}>No tasks matched the selected tech.</Typography>
              )}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

const DashboardProfessionalExperience: React.FC = () => {
  const { user } = useAuth();
  const { activeLanguage } = useLanguage();

  const [items, setItems] = useState<Experience[]>([]);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<Record<string, string | null>>({});

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const t = useMemo<TStrings>(() => {
    const d: any = activeLanguage?.dictionary ?? {};
    return {
      hint: d?.descriptions?.dExperience ?? d?.professionalExperience ?? "Professional Experience",
      showMore: d?.showMpore ?? "Show more",
      showLess: d?.close ?? "Show less",
      current: d?.current ?? "Current",
      noExperience: d?.noExperience ?? "No experience added.",
      techFocus: d?.techFocus ?? "Tech focus",
      clickToFocus: d?.clickToFocus ?? "Click a tech to filter tasks and highlight matches",
      reset: d?.reset ?? "Reset",
      matches: d?.matches ?? "matches",
      tasks: d?.tasks ?? "tasks",
    };
  }, [activeLanguage]);

  useEffect(() => {
    fetchApi("/users/me")
      .then((me: any) => {
        const pid = me?.profile?.id;
        if (!pid) return [];
        return fetchApi(`/api/profile/${pid}/experiences`, { method: "GET" });
      })
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sorted = useMemo(() => {
    const list = Array.isArray(items) ? [...items] : [];
    return list
      .sort((a, b) => {
        if (!!a.isCurrent !== !!b.isCurrent) return a.isCurrent ? -1 : 1;
        const ad = new Date(a.startDate).getTime();
        const bd = new Date(b.startDate).getTime();
        return (bd || 0) - (ad || 0);
      })
      .filter((x) => String(x?.title ?? "").trim().length > 0 && String(x?.company ?? "").trim().length > 0);
  }, [items]);

  const hasMore = sorted.length > 3;
  const shown = useMemo(() => (expanded ? sorted : sorted.slice(0, 3)), [expanded, sorted]);
  const locale = user?.profile?.locale ?? "en-US";

  const scrollOn = useAutoScrollToggle({
    containerRef: listRef as React.RefObject<HTMLElement>,
    deps: [shown.length, openId, expanded],
    maxHeight: 620,
  });

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (!scrollOn) return;
    if (!openId) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollOn, openId]);

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "relative",
        p: 1.5,
        background: "transparent",
        border: "none",
        boxShadow: "none",

        "@keyframes peIn": {
          "0%": { opacity: 0, transform: "translateY(10px) scale(.985)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "@keyframes peSheen": {
          "0%": { transform: "translateX(-70%) rotate(12deg)" },
          "100%": { transform: "translateX(170%) rotate(12deg)" },
        },
      }}
    >
      <Typography sx={{ fontWeight: 900, opacity: 0.72, mb: 1 }}>{t.hint}</Typography>

      {shown.length === 0 ? (
        <Typography sx={{ opacity: 0.7 }}>{t.noExperience}</Typography>
      ) : (
        <Box
          ref={listRef}
          sx={{
            display: "grid",
            gap: 1.25,
            position: "relative",
            zIndex: 1,
            maxHeight: scrollOn ? 620 : "none",
            overflowY: scrollOn ? "auto" : "visible",
            pr: scrollOn ? 0.5 : 0,
            scrollBehavior: "smooth",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {shown.map((exp, idx) => {
            const isOpen = openId === exp.id;
            const focused = activeTech[exp.id] ?? null;

            return (
              <ExperienceRow
                key={exp.id}
                exp={exp}
                idx={idx}
                visible={visible}
                locale={locale}
                isOpen={isOpen}
                open={() => setOpenId(exp.id)}
                close={() => setOpenId(null)}
                activeTech={focused}
                setActiveTech={(v) => setActiveTech((m) => ({ ...m, [exp.id]: v }))}
                t={t}
              />
            );
          })}

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
              {expanded ? t.showLess : t.showMore}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DashboardProfessionalExperience;
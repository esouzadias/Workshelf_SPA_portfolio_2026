// DashboardHighlights.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Avatar, IconButton, Chip, Stack, Divider } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";
import "../../../../styles/global.styles.less";

type Profile = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  birthDate?: string | null;
  maritalStatus?: string | null;
  dependents?: number | null;
  currentTitle?: string | null;
  about?: string | null;
};

type Skill = { name: string; proficiency: number; icon?: string | null };

type Experience = {
  id: string;
  company: string;
  companyLogoUrl?: string | null;
  title: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

type Language = { name: string; level: string; native?: boolean };

type Education = {
  id: string;
  education?: string | null;
  school: string;
  schoolLogoUrl?: string | null;
  degree?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
};

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

const LogoDot = ({ src, alt, size = 18 }: { src?: string | null; alt: string; size?: number }) => {
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
        fontSize: Math.max(9, Math.floor(size * 0.55)),
        color: "rgba(255,255,255,.92)",
        background: `linear-gradient(135deg, ${bg}, rgba(255,255,255,.12))`,
        border: "1px solid rgba(255,255,255,.14)",
        flex: "0 0 auto",
      }}
    >
      {initials(alt)}
    </Box>
  );
};

function calcTotalExperienceMonths(exps: Experience[]): number {
  const ranges = (exps ?? [])
    .filter((e) => e?.startDate)
    .map((e) => {
      const s = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : new Date();
      if (isNaN(s.getTime()) || isNaN(end.getTime())) return null;
      const a = s.getTime();
      const b = end.getTime();
      return a <= b ? ([a, b] as const) : ([b, a] as const);
    })
    .filter(Boolean) as Array<readonly [number, number]>;

  if (ranges.length === 0) return 0;

  ranges.sort((x, y) => x[0] - y[0]);

  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (!last || start > last[1]) merged.push([start, end]);
    else last[1] = Math.max(last[1], end);
  }

  const totalMonths = merged.reduce((acc, [a, b]) => {
    const s = new Date(a);
    const e = new Date(b);
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) months -= 1;
    return acc + Math.max(0, months);
  }, 0);

  return totalMonths;
}

function formatExperienceLabel(totalMonths: number, yearsLabel: string): string {
  if (totalMonths <= 0) return `0 ${yearsLabel}`;
  if (totalMonths < 12) return `${totalMonths} mo`;
  const years = totalMonths / 12;
  const v = years < 10 ? years.toFixed(1) : `${Math.round(years)}`;
  return `${v} ${yearsLabel}`;
}

const formatDate = (iso: string, locale: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(d);
};

function yearsBetween(start: string, end?: string | null): number | null {
  if (!start) return null;
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

  const anniv = new Date(d2.getFullYear(), d1.getMonth(), d1.getDate());
  return d2.getFullYear() - d1.getFullYear() - (d2 < anniv ? 1 : 0);
}

const DashboardHighlights: React.FC = () => {
  const { activeLanguage } = useLanguage();
  const dict: any = activeLanguage?.dictionary ?? {};

  const t = useMemo(() => {
    return {
      years: dict?.years ?? "years",
      dependents: dict?.dependents ?? "dependents",
      aboutMe: dict?.aboutMe ?? "About me",
      languages: dict?.languages ?? "Languages",
      topTech: dict?.topTechnologies ?? "Top Technologies",
      education: dict?.education ?? "Education",
      profExp: dict?.professionalExperience ?? "Professional Experience",
      loading: dict?.loading ?? "Loading...",
      noDesc: dict?.noDescriptionProvided ?? "No description provided.",
      noLang: dict?.noLanguagesAdded ?? "No languages added.",
      noSkills: dict?.noSkillsAdded ?? "No skills added.",
      noExp: dict?.noExperienceAdded ?? "No experiences added.",
      noEdu: dict?.noEducationAdded ?? "No education added.",
      present: dict?.present ?? "Present",
    };
  }, [dict]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi("/users/me")
      .then((me: any) => {
        const p = me?.profile;
        const pid = p?.id;

        setProfile({
          id: pid,
          fullName: p?.fullName || p?.name || "",
          avatarUrl: p?.avatarUrl,
          birthDate: p?.birthDate,
          maritalStatus: p?.maritalStatus,
          dependents: p?.dependents,
          currentTitle: p?.currentTitle || p?.role,
          about: p?.about,
        });

        return pid;
      })
      .then((profileId: string) =>
        Promise.all([
          fetchApi(`/api/profile/${profileId}/skills`),
          fetchApi(`/api/profile/${profileId}/experiences`),
          fetchApi(`/api/profile/${profileId}/educations`),
          fetchApi(`/api/profile/${profileId}/languages`),
        ])
      )
      .then(([skillsData, expData, eduData, langData]) => {
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setExperiences(Array.isArray(expData) ? expData : []);
        setEducations(Array.isArray(eduData) ? eduData : []);
        setLanguages(Array.isArray(langData) ? langData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const topSkills = useMemo(
    () =>
      [...skills]
        .filter((s) => s && s.name)
        .sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0))
        .slice(0, 5),
    [skills]
  );

  const topExperiences = useMemo(
    () =>
      [...experiences]
        .filter((e) => e && e.startDate)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 4),
    [experiences]
  );

  // ✅ Top 3 educations (most recent first)
  const topEducations = useMemo(() => {
    const items = Array.isArray(educations) ? [...educations] : [];

    items.sort((a, b) => {
      if (!!a.isCurrent !== !!b.isCurrent) return a.isCurrent ? -1 : 1;

      const ae = a.endDate ? new Date(a.endDate).getTime() : -Infinity;
      const be = b.endDate ? new Date(b.endDate).getTime() : -Infinity;
      if (be !== ae) return be - ae;

      const as = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
      const bs = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
      return bs - as;
    });

    return items.slice(0, 3);
  }, [educations]);

  const totalExperienceMonths = useMemo(() => calcTotalExperienceMonths(experiences), [experiences]);
  const experienceLabel = useMemo(
    () => formatExperienceLabel(totalExperienceMonths, t.years),
    [totalExperienceMonths, t.years]
  );

  const locale = useMemo(() => dict?.locale || "en-US", [dict]);

  const dependentsText =
    profile?.dependents && profile.dependents > 0 ? `${profile.dependents} ${t.dependents}` : null;

  const handleExportPdf = () => {
    if (!profile) return;

    const esc = (v: any) => String(v ?? "") .replace(/&/g, "&amp;") .replace(/</g, "&lt;") .replace(/>/g, "&gt;") .replace(/\"/g, "&quot;") .replace(/'/g, "&#39;");

    const roleLine = [profile.currentTitle, experienceLabel].filter(Boolean).join(" · ");
    const metaLine = [profile.maritalStatus ? esc(profile.maritalStatus) : "", dependentsText ? esc(dependentsText) : ""].filter(Boolean).join(" · ");

    const langsHtml = (languages ?? []).map((l) => {
        const label = `${esc(l.name)} — ${esc(l.level)}${l.native ? " (native)" : ""}`;
        return `<div class="pill">${label}</div>`;
      }).join("");

    const skillsHtml = (topSkills ?? []).map((s) => {
        const icon = s.icon
          ? `<img class="pill__icon" src="${esc(s.icon)}" alt="" />`
          : `<span class="pill__dot" aria-hidden="true"></span>`;
        return `<div class="pill pill--skill">${icon}<span>${esc(s.name)}</span></div>`;
      }).join("");

    // ✅ 3 educations in PDF
    const eduHtml = (topEducations ?? []).map((edu) => {
        const range = `${esc(formatDate(edu.startDate, locale))} — ${esc( edu.isCurrent ? t.present : edu.endDate ? formatDate(edu.endDate, locale) : t.present )}`;

        const schoolLogo = edu.schoolLogoUrl
          ? `<img class="edu__logo" src="${esc(edu.schoolLogoUrl)}" alt="${esc(edu.school)}" />`
          : `<span class="edu__logo edu__logo--fallback">${esc(initials(edu.school))}</span>`;

        const line2 = [edu.degree, edu.education].filter(Boolean).map(esc).join(" · ");

        return `
          <div class="edu">
            <div class="edu__top">
              <div class="edu__school">${schoolLogo}<span>${esc(edu.school)}</span></div>
              <div class="edu__meta">${range}</div>
            </div>
            ${line2 ? `<div class="edu__line">${line2}</div>` : ""}
          </div>
        `;
      }).join("");

    const expHtml = (topExperiences ?? []).map((e) => {
        const range = `${esc(formatDate(e.startDate, locale))} — ${esc(e.endDate ? formatDate(e.endDate, locale) : t.present)}`;
        const yrs = yearsBetween(e.startDate, e.endDate ?? null);
        const dur = yrs && yrs > 0 ? ` · ${esc(yrs)} ${esc(t.years)}` : "";

        const logo = e.companyLogoUrl
          ? `<img class="exp__logo" src="${esc(e.companyLogoUrl)}" alt="${esc(e.company)}" />`
          : `<span class="exp__logo exp__logo--fallback">${esc(initials(e.company))}</span>`;

        const desc = e.description ? `<div class="exp__desc">${esc(e.description)}</div>` : "";

        return `
          <div class="exp">
            <div class="exp__top">
              <div class="exp__title">${esc(e.title)}</div>
              <div class="exp__company">${logo}<span>${esc(e.company)}</span></div>
            </div>
            <div class="exp__meta">${range}${dur}</div>
            ${desc}
          </div>
        `;
      }).join("");

    const aboutHtml = profile.about ? esc(profile.about) : esc(t.noDesc);

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Profile</title>
          <style>
            :root{
              --ink:#0b1020;
              --muted:#475569;
              --line:#e6eaf2;
              --bg:#ffffff;
              --card:#ffffff;
              --soft:#f6f8fc;
              --accent:#6366f1;
            }
            *{box-sizing:border-box}
            body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,"Apple Color Emoji","Segoe UI Emoji";}
            .page{max-width:980px;margin:0 auto;padding:28px;}
            .cv{display:grid;grid-template-columns:280px 1fr;gap:18px;min-height:100%;}

            .side{border-radius:16px;overflow:hidden;padding:16px;background:#fff;border:1px solid var(--line);color:var(--ink);}
            .avatarRow{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
            .avatar{width:64px;height:64px;border-radius:999px;object-fit:cover;border:1px solid var(--line);box-shadow:none;background:var(--soft);}
            .avatarFallback{display:grid;place-items:center;font-weight:900;letter-spacing:.5px;}
            .name{font-weight:900;font-size:20px;line-height:1.15;}
            .role{margin-top:6px;font-weight:800;color:var(--muted);font-size:13.5px;}
            .meta{margin-top:6px;font-weight:700;color:var(--muted);font-size:12.5px;}

            .sideSection{margin-top:14px;}
            .sideTitle{font-weight:900;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 8px 0;}
            .pills{display:flex;flex-wrap:wrap;gap:8px;}
            .pill{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;border:1px solid var(--line);background:#fff;font-weight:800;font-size:12px;max-width:100%;}
            .pill__icon{width:16px;height:16px;border-radius:999px;object-fit:cover;border:1px solid var(--line)}
            .pill__dot{width:10px;height:10px;border-radius:999px;background:var(--accent);opacity:.85}

            .main{border-radius:16px;padding:16px;background:#fff;border:1px solid var(--line);}
            .section{margin-top:14px;}
            .sectionTitle{font-weight:1000;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 8px 0;}
            .panel{border:1px solid var(--line);background:var(--soft);border-radius:14px;padding:12px;}
            .about{white-space:pre-line;font-weight:750;color:#0f172a;line-height:1.45;}

            .edu{border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px;}
            .edu__top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
            .edu__school{display:inline-flex;align-items:center;gap:8px;font-weight:1000;min-width:0;}
            .edu__meta{font-size:12px;font-weight:800;color:var(--muted);white-space:nowrap;}
            .edu__line{margin-top:6px;font-size:12.5px;font-weight:800;color:#0f172a;opacity:.9;}
            .edu__logo{width:18px;height:18px;border-radius:999px;object-fit:cover;border:1px solid var(--line)}
            .edu__logo--fallback{display:grid;place-items:center;background:var(--soft);font-size:10px;font-weight:1000;color:#111827;border:1px solid var(--line);width:18px;height:18px;border-radius:999px;}

            .expList{display:grid;gap:10px;}
            .exp{border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px;}
            .exp__top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
            .exp__title{font-weight:1000;font-size:14px;}
            .exp__company{display:inline-flex;align-items:center;gap:8px;font-weight:900;color:#111827;min-width:0;}
            .exp__logo{width:18px;height:18px;border-radius:999px;object-fit:cover;border:1px solid var(--line)}
            .exp__logo--fallback{display:grid;place-items:center;background:var(--soft);font-size:10px;font-weight:1000;color:#111827;border:1px solid var(--line)}
            .exp__meta{margin-top:6px;font-size:12px;font-weight:800;color:var(--muted);}
            .exp__desc{margin-top:8px;font-size:12.5px;font-weight:700;color:#0f172a;line-height:1.42;white-space:pre-line;}

            @media print{
              body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
              .page{padding:0;margin:0;}
              .cv{gap:14px;}
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="cv">
              <aside class="side">
                <div class="avatarRow">
                  ${
                    profile.avatarUrl
                      ? `<img class="avatar" src="${esc(profile.avatarUrl)}" alt="" />`
                      : `<div class="avatar avatarFallback">${esc(initials(profile.fullName))}</div>`
                  }
                  <div style="min-width:0">
                    <div class="name">${esc(profile.fullName)}</div>
                    ${roleLine ? `<div class="role">${esc(roleLine)}</div>` : ""}
                    ${metaLine ? `<div class="meta">${metaLine}</div>` : ""}
                  </div>
                </div>

                <div class="sideSection">
                  <div class="sideTitle">Languages</div>
                  <div class="pills">${langsHtml || `<div class="pill">—</div>`}</div>
                </div>

                <div class="sideSection">
                  <div class="sideTitle">Top Technologies</div>
                  <div class="pills">${skillsHtml || `<div class="pill">—</div>`}</div>
                </div>
              </aside>

              <main class="main">
                <div class="section">
                  <div class="sectionTitle">About</div>
                  <div class="panel"><div class="about">${aboutHtml}</div></div>
                </div>

                <div class="section">
                  <div class="sectionTitle">Education</div>
                  ${eduHtml || `<div class="panel">${esc(t.noEdu)}</div>`}
                </div>

                <div class="section">
                  <div class="sectionTitle">Professional Experience</div>
                  <div class="expList">${expHtml || `<div class="panel">${esc(t.noExp)}</div>`}</div>
                </div>
              </main>
            </div>
          </div>

          <script>
            window.onload = function(){
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=980,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">{t.loading}</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={contentRef}
      sx={{
        p: 0,
        maxWidth: "100%",
        margin: 0,
        background: "transparent",
        border: "none",
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "grid", gap: 1.6 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0 }}>
            <Avatar
              src={profile?.avatarUrl || undefined}
              sx={{
                width: 72,
                height: 72,
                border: "1px solid rgba(255,255,255,.16)",
                boxShadow: "0 0 14px rgba(0,0,0,.25)",
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 1000,
                  letterSpacing: ".2px",
                  fontSize: 22,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile?.fullName}
              </Typography>

              <Typography
                sx={{
                  fontWeight: 900,
                  opacity: 0.72,
                  mt: 0.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile?.currentTitle}
                {profile?.currentTitle && experienceLabel ? " · " : ""}
                {experienceLabel ? experienceLabel : null}
              </Typography>

              <Typography
                sx={{
                  fontWeight: 900,
                  opacity: 0.62,
                  mt: 0.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile?.maritalStatus ? profile.maritalStatus : ""}
                {profile?.maritalStatus && dependentsText ? " · " : ""}
                {dependentsText ? dependentsText : ""}
              </Typography>
            </Box>
          </Box>

          <IconButton aria-label="Export PDF" onClick={handleExportPdf} sx={{ color: "var(--primary)"}}>
            <PictureAsPdfIcon fontSize="large" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,.10)" }} />

        <Box>
          <Typography sx={{ fontWeight: 1000, opacity: 0.85, mb: 0.6 }}>{t.aboutMe}</Typography>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(0,0,0,.16)",
              p: 1.1,
              boxShadow: "0 0 10px rgba(0,0,0,.18)",
            }}
          >
            <Typography sx={{ fontWeight: 900, opacity: 0.88, whiteSpace: "pre-line" }}>
              {profile?.about || t.noDesc}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,.10)" }} />

        <Box>
          <Typography sx={{ fontWeight: 1000, opacity: 0.85, mb: 0.6 }}>{t.languages}</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {languages.length === 0 && <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>{t.noLang}</Typography>}
            {languages.map((lang, idx) => (
              <Chip
                key={lang.name + idx}
                label={`${lang.name} (${lang.level}${lang.native ? ", native" : ""})`}
                sx={{
                  fontWeight: 1000,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: lang.native ? "rgba(99,102,241,.16)" : "rgba(255,255,255,.04)",
                  color: "var(--primary)",
                  boxShadow: "0 0 10px rgba(0,0,0,.18)",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,.10)" }} />

        <Box>
          <Typography sx={{ fontWeight: 1000, opacity: 0.85, mb: 0.6 }}>{t.topTech}</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {topSkills.length === 0 && <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>{t.noSkills}</Typography>}
            {topSkills.map((skill, idx) => (
              <Chip
                key={skill.name + idx}
                label={skill.name}
                icon={
                  skill.icon ? (
                    <img src={skill.icon} alt="" style={{ width: 18, height: 18, borderRadius: 999 }} />
                  ) : undefined
                }
                sx={{
                  fontWeight: 1000,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  color: "var(--primary)",
                  boxShadow: "0 0 10px rgba(0,0,0,.18)",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,.10)" }} />

        {/* ✅ Education: show 3 most recent */}
        <Box>
          <Typography sx={{ fontWeight: 1000, opacity: 0.85, mb: 0.8 }}>{t.education}</Typography>

          {topEducations.length === 0 ? (
            <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>{t.noEdu}</Typography>
          ) : (
            <Stack spacing={1.15}>
              {topEducations.map((edu) => {
                const range = `${formatDate(edu.startDate, locale)} — ${
                  edu.isCurrent ? t.present : edu.endDate ? formatDate(edu.endDate, locale) : t.present
                }`;
                const line2 = [edu.degree, edu.education].filter(Boolean).join(" · ");

                return (
                  <Box
                    key={edu.id}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(0,0,0,.14)",
                      p: 1.2,
                      boxShadow: "0 0 12px rgba(0,0,0,.22)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                      <LogoDot src={edu.schoolLogoUrl ?? null} alt={edu.school} size={18} />
                      <Typography
                        sx={{
                          fontWeight: 1000,
                          opacity: 0.94,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {edu.school}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 900, opacity: 0.72, mt: 0.35, fontSize: 12.75 }}>
                      {range}
                    </Typography>

                    {line2 && (
                      <Typography
                        sx={{
                          fontWeight: 900,
                          opacity: 0.86,
                          mt: 0.55,
                          fontSize: 13.25,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {line2}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,.10)" }} />

        <Box>
          <Typography sx={{ fontWeight: 1000, opacity: 0.85, mb: 0.8 }}>{t.profExp}</Typography>

          {topExperiences.length === 0 && <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>{t.noExp}</Typography>}

          <Stack spacing={1.15}>
            {topExperiences.map((exp) => {
              const years = yearsBetween(exp.startDate, exp.endDate ?? null);
              const range = `${formatDate(exp.startDate, locale)} — ${
                exp.endDate ? formatDate(exp.endDate, locale) : t.present
              }`;

              return (
                <Box
                  key={exp.id}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.14)",
                    p: 1.2,
                    boxShadow: "0 0 12px rgba(0,0,0,.22)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 1000,
                        opacity: 0.94,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exp.title}
                    </Typography>

                    <Typography sx={{ fontWeight: 1000, opacity: 0.55, flex: "0 0 auto" }}>·</Typography>

                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.55, minWidth: 0, flex: "0 1 auto" }}>
                      <LogoDot src={exp.companyLogoUrl ?? null} alt={exp.company} size={18} />
                      <Typography
                        sx={{
                          fontWeight: 1000,
                          opacity: 0.90,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {exp.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontWeight: 900, opacity: 0.72, mt: 0.35, fontSize: 12.75 }}>
                    {range}
                    {years && years > 0 ? ` · ${years} ${t.years}` : ""}
                  </Typography>

                  {exp.description && (
                    <Typography
                      sx={{
                        fontWeight: 900,
                        opacity: 0.86,
                        mt: 0.65,
                        fontSize: 13.25,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {exp.description}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHighlights;
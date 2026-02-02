import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Section } from "../../../../lib/Models";
import WorkSectionCerts from "./WorkSectionCerts";
import WorkSkillsSection from "./WorkSkillsSection";

type Client = { id?: string; name: string; logo: string | null };
type WorkBlock = {
  id?: string;
  companyName: string;
  companyLogo: string | null;
  title: string;
  start: string;
  end: string;
  isCurrent: boolean;
  isConsultancy: boolean;
  clients: Client[];
};
type Skill = {
  id?: string;
  name: string;
  proficiency: number;
  icon?: string | null;
  order?: number;
};

type Props = {
  activeLanguage: any;
  employmentStatus: any;
  setEmploymentStatus: (v: any) => void;
  editing: boolean;
  profileEnums: any;
  workBlocks: WorkBlock[];
  setWorkBlocks: React.Dispatch<React.SetStateAction<WorkBlock[]>>;
  resizeImageToDataUrl: (file: File, maxSize?: number, quality?: number) => Promise<string>;
  registerBeforeSave?: (fn: () => Promise<void>) => void;

  profileId: string;
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
};

type TabKey = "work" | "skills" | "certs";

const WorkSection: React.FC<Props> = ({
  activeLanguage,
  employmentStatus,
  setEmploymentStatus,
  editing,
  profileEnums,
  workBlocks,
  setWorkBlocks,
  resizeImageToDataUrl,
  registerBeforeSave,
  profileId,
  skills,
  onSkillsChange,
}) => {
  const [tab, setTab] = useState<TabKey>("work");

  const tabs = useMemo(
    () => [
      { key: "work" as const, label: activeLanguage.dictionary.work ?? "Work", icon: <WorkRoundedIcon fontSize="small" /> },
      { key: "skills" as const, label: activeLanguage.dictionary.categories?.skills ?? "Skills", icon: <AutoGraphRoundedIcon fontSize="small" /> },
      {
        key: "certs" as const,
        label: activeLanguage.dictionary.categories?.certifications ?? "Certifications",
        icon: <WorkspacePremiumRoundedIcon fontSize="small" />,
      },
    ],
    [activeLanguage]
  );

  const setWork = useCallback(
    (workIndex: number, patch: Partial<WorkBlock>) =>
      setWorkBlocks((prev) => prev.map((block, i) => (i === workIndex ? { ...block, ...patch } : block))),
    [setWorkBlocks]
  );

  const setClient = useCallback(
    (workIndex: number, clientIndex: number, patch: Partial<Client>) =>
      setWorkBlocks((prev) =>
        prev.map((block, i) =>
          i !== workIndex
            ? block
            : {
              ...block,
              clients: block.clients.map((client, j) => (j === clientIndex ? { ...client, ...patch } : client)),
            }
        )
      ),
    [setWorkBlocks]
  );

  const handleCompanyLogoChange = useCallback(
    (workIndex: number): React.ChangeEventHandler<HTMLInputElement> =>
      async (e) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = "";
        if (!file) return;
        try {
          const dataUrl = await resizeImageToDataUrl(file, 160, 0.8);
          setWork(workIndex, { companyLogo: dataUrl });
        } catch (err) {
          console.error("Failed to resize image:", err);
        }
      },
    [resizeImageToDataUrl, setWork]
  );

  const handleClientLogoChange = useCallback(
    (workIndex: number, clientIndex: number): React.ChangeEventHandler<HTMLInputElement> =>
      async (e) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = "";
        if (!file) return;
        try {
          const dataUrl = await resizeImageToDataUrl(file, 160, 0.8);
          setClient(workIndex, clientIndex, { logo: dataUrl });
        } catch (err) {
          console.error("Failed to resize image:", err);
        }
      },
    [resizeImageToDataUrl, setClient]
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const setPointerVars = (x: number, y: number, a: number) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--ma", `${a}`);
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPointerVars(x, y, 1));
  };

  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPointerVars(0, 0, 0);
  };

  useEffect(() => {
    setPointerVars(0, 0, 0);
  }, [tab]);

  const maxPanelHeight = "min(74vh, 820px)";

  return (
    <Box
      ref={rootRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      sx={{
        width: "100%",
        height: "100%",
        // maxWidth: 1080,
        mx: "auto",
        mb: 3,

        "--mx": "0px",
        "--my": "0px",
        "--ma": "0",

        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "280px 1fr" },
        gap: 2,
        alignItems: "stretch",

        "@keyframes wsTabSelect": {
          "0%": { transform: "translateY(2px) scale(.992)", filter: "saturate(1)" },
          "60%": { transform: "translateY(-1px) scale(1.01)", filter: "saturate(1.14)" },
          "100%": { transform: "translateY(0px) scale(1)", filter: "saturate(1.10)" },
        },
        "@keyframes wsIconWiggle": {
          "0%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "35%": { transform: "translateY(-2px) rotate(-6deg) scale(1.08)" },
          "70%": { transform: "translateY(0px) rotate(5deg) scale(1.06)" },
          "100%": { transform: "translateY(0px) rotate(0deg) scale(1.04)" },
        },
        "@keyframes wsSheenSweep": {
          "0%": { transform: "translateX(-70%) rotate(12deg)" },
          "100%": { transform: "translateX(170%) rotate(12deg)" },
        },

        "&::after": {
          content: '""',
          position: "absolute",
          inset: -2,
          pointerEvents: "none",
          opacity: "var(--ma)",
          transition: "opacity 180ms ease",
          background:
            "radial-gradient(360px circle at var(--mx) var(--my), rgba(255,255,255,.14), rgba(255,255,255,.06) 34%, transparent 62%)",
          filter: "blur(12px)",
          borderRadius: 24,
        },

        position: "relative",
      }}
    >
      {/* Tabs panel */}
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,.10)",
          background: "linear-gradient(135deg, rgba(255,255,255,.028), rgba(255,255,255,.010))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 0 10px rgba(0,0,0,.22)",
          overflow: "hidden",
          position: "relative",
          p: 1.25,
          minHeight: { xs: "auto", sm: 520 },

          "&::before": {
            content: '""',
            position: "absolute",
            inset: -6,
            pointerEvents: "none",
            background:
              "radial-gradient(900px circle at 20% 10%, rgba(99,102,241,.06), transparent 58%), radial-gradient(700px circle at 85% 30%, rgba(236,72,153,.045), transparent 56%)",
            opacity: 0.75,
            filter: "saturate(1.02)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, rgba(255,255,255,.10), transparent 24%)",
            opacity: 0.55,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontWeight: 900, opacity: 0.9, px: 1, pt: 0.75, pb: 1 }}>
            {activeLanguage.dictionary.work ?? "Work"}
          </Typography>

          <Box sx={{ display: "grid", gap: 1 }}>
            {tabs.map((t) => {
              const selected = tab === t.key;

              return (
                <Box
                  key={t.key}
                  component="button"
                  type="button"
                  onClick={() => setTab(t.key)}
                  sx={{
                    appearance: "none",
                    border: "1px solid rgba(255,255,255,.10)",
                    borderRadius: 2.25,
                    background: selected
                      ? "linear-gradient(135deg, rgba(99,102,241,.26), rgba(236,72,153,.16), rgba(34,211,238,.12))"
                      : "linear-gradient(135deg, rgba(255,255,255,.030), rgba(255,255,255,.010))",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",

                    // Default text = faded, selected = vivid
                    color: selected ? "rgba(255,255,255,.94)" : "rgba(255,255,255,.66)",

                    textAlign: "left",
                    cursor: "pointer",
                    p: 1.05,

                    display: "grid",
                    gridTemplateColumns: "42px 1fr",
                    alignItems: "center",
                    gap: 1.25,

                    opacity: selected ? 1 : 0.68,

                    position: "relative",
                    overflow: "hidden",

                    transition:
                      "transform 170ms ease, background 200ms ease, border-color 170ms ease, box-shadow 170ms ease, opacity 200ms ease, filter 200ms ease, color 200ms ease",

                    boxShadow: selected ? "0 0 14px rgba(0,0,0,.28)" : "0 0 6px rgba(0,0,0,.16)",

                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: -40,
                      background: "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.18) 18%, transparent 36%)",
                      opacity: selected ? 0.18 : 0,
                      transform: "translateX(-70%) rotate(12deg)",
                      pointerEvents: "none",
                    },

                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: selected ? "rgba(255,255,255,.24)" : "rgba(255,255,255,.18)",
                      boxShadow: selected ? "0 0 18px rgba(0,0,0,.30)" : "0 0 14px rgba(0,0,0,.24)",
                      opacity: 0.92,
                      filter: "saturate(1.08)",
                      color: selected ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.80)",
                      "&::after": {
                        opacity: 0.28,
                        animation: "wsSheenSweep 900ms ease both",
                      },
                      "& .ws-tab-icon": {
                        animation: "wsIconWiggle 420ms cubic-bezier(.2,.9,.2,1) both",
                      },
                      "& .MuiSvgIcon-root": {
                        filter: "drop-shadow(0 0 10px rgba(99,102,241,.22))",
                      },
                    },

                    "&:active": { transform: "translateY(-1px) scale(.99)" },

                    ...(selected ? { animation: "wsTabSelect 260ms cubic-bezier(.2,.9,.2,1) both" } : {}),
                  }}
                >
                  <Box
                    className="ws-tab-icon"
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,.16)",
                      /* boxShadow: "0 0 10px rgba(0,0,0,.20)", */
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 170ms ease, box-shadow 170ms ease, border-color 170ms ease, filter 170ms ease",

                      // Icon container: strong gradient only when selected
                      background: selected
                        ? "linear-gradient(135deg, rgba(99,102,241,.70), rgba(236,72,153,.55), rgba(34,211,238,.48))"
                        : "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))",

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: 999,
                        pointerEvents: "none",
                        background:
                          "radial-gradient(18px circle at 28% 26%, rgba(255,255,255,.18), transparent 62%)," +
                          "linear-gradient(135deg, rgba(255,255,255,.22), transparent 58%)",
                        opacity: selected ? 0.95 : 0.75,
                      },

                      ...(selected
                        ? {
                          borderColor: "rgba(255,255,255,.26)",
                          boxShadow: "0 0 16px rgba(0,0,0,.30)",
                          transform: "scale(1.04)",
                          filter: "saturate(1.2) contrast(1.05)",
                          "& .MuiSvgIcon-root": {
                            color: "rgba(255,255,255,.98)",
                            filter: "drop-shadow(0 0 12px rgba(255,255,255,.18))",
                          },
                        }
                        : {
                          "& .MuiSvgIcon-root": {
                            color: "rgba(255,255,255,.70)",
                          },
                        }),
                    }}
                  >
                    {t.icon}
                  </Box>

                  <Typography sx={{ fontWeight: 900, opacity: selected ? 0.98 : 0.70, whiteSpace: "nowrap" }}>
                    {t.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Content panel */}
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,.10)",
          background: "linear-gradient(135deg, rgba(255,255,255,.028), rgba(255,255,255,.010))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 0 10px rgba(0,0,0,.22)",
          overflow: "hidden",
          position: "relative",

          minHeight: 520,
          maxHeight: { xs: "none", sm: maxPanelHeight },

          "&::before": {
            content: '""',
            position: "absolute",
            inset: -6,
            pointerEvents: "none",
            background:
              "radial-gradient(900px circle at 20% 10%, rgba(99,102,241,.06), transparent 62%), radial-gradient(700px circle at 85% 30%, rgba(236,72,153,.04), transparent 58%)",
            opacity: 0.68,
            filter: "saturate(1.02)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, rgba(255,255,255,.10), transparent 24%)",
            opacity: 0.55,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            p: 2,
          }}
        >
          {/* Only Skills tab gets internal scroll. */}
          <Box
            sx={{
              height: "100%",
              overflowY: tab === "skills" ? { xs: "visible", sm: "auto" } : "visible",
              "&::-webkit-scrollbar": { width: 10 },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,.10)",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.10)",
              },
              "&::-webkit-scrollbar-track": { background: "transparent" },
            }}
          >
            {tab === "work" && (
              <Section title={activeLanguage.dictionary.work ?? "Work"}>
                <div>
                  <div style={{fontWeight: 600}}>{activeLanguage.dictionary.employmentStatus}</div>
                  <select
                    className="input"
                    value={employmentStatus ?? ""}
                    onChange={(e) => setEmploymentStatus?.(e.target.value || null)}
                    disabled={!editing || !profileEnums.employmentStatus?.length}
                  >
                    {profileEnums.employmentStatus?.map((status: string) => (
                      <option key={status} value={status}>
                        {(activeLanguage.dictionary as any)[status] ?? status}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
                  {workBlocks.map((work, workIndex) => (
                    <div
                      key={work.id ?? workIndex}
                      style={{
                        border: "1px solid rgba(148,163,184,.25)",
                        borderRadius: 12,
                        padding: 12,
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.company}</div>
                          <input
                            className="input"
                            value={work.companyName ?? ""}
                            onChange={(e) => setWork(workIndex, { companyName: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.companyLogo}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <img
                              src={work.companyLogo || "data:image/gif;base64,R0lGODlhAQABAAAAACw="}
                              alt=""
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                objectFit: "cover",
                                border: "1px solid #e5e7eb",
                                background: "#f3f4f6",
                              }}
                            />
                            {editing && (
                              <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                                {activeLanguage.dictionary.upload}
                                <input type="file" accept="image/*" onChange={handleCompanyLogoChange(workIndex)} style={{ display: "none" }} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.currentRole}</div>
                        <input
                          className="input"
                          value={work.title ?? ""}
                          onChange={(e) => setWork(workIndex, { title: e.target.value })}
                          disabled={!editing}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.startDate ?? "Start date"}</div>
                          <input
                            className="input"
                            type="date"
                            value={work.start ?? ""}
                            onChange={(e) => setWork(workIndex, { start: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.endDate ?? "End date"}</div>
                          {editing ? (
                            <>
                              <input
                                className="input"
                                type="date"
                                value={work.end ?? ""}
                                onChange={(e) => setWork(workIndex, { end: e.target.value })}
                                disabled={!editing || work.isCurrent}
                              />
                              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                  type="checkbox"
                                  checked={!!work.isCurrent}
                                  onChange={(e) =>
                                    setWork(workIndex, { isCurrent: e.target.checked, end: e.target.checked ? "" : work.end })
                                  }
                                  disabled={!editing}
                                />
                                <span>{activeLanguage.dictionary.current}</span>
                              </label>
                            </>
                          ) : work.isCurrent ? (
                            <span style={{ opacity: 0.6 }}>— {activeLanguage.dictionary.current}</span>
                          ) : (
                            <input
                              className="input"
                              type="date"
                              value={work.end ?? ""}
                              onChange={(e) => setWork(workIndex, { end: e.target.value })}
                              disabled={!editing}
                            />
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          id={`consultancy-${work.id ?? workIndex}`}
                          type="checkbox"
                          checked={!!work.isConsultancy}
                          onChange={(e) => setWork(workIndex, { isConsultancy: e.target.checked })}
                          disabled={!editing}
                        />
                        <label htmlFor={`consultancy-${work.id ?? workIndex}`} style={{ userSelect: "none" }}>
                          {activeLanguage.dictionary.consultancy ?? "Consultancy"}
                        </label>
                      </div>

                      {work.isConsultancy && (
                        <div style={{ display: "grid", gap: 10 }}>
                          {work.clients.map((client, clientIndex) => (
                            <div
                              key={client.id ?? clientIndex}
                              style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center" }}
                            >
                              <input
                                className="input"
                                placeholder={activeLanguage.dictionary.client}
                                value={client.name ?? ""}
                                onChange={(e) => setClient(workIndex, clientIndex, { name: e.target.value })}
                                disabled={!editing}
                              />
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <img
                                  src={client.logo || "data:image/gif;base64,R0lGODlhAQABAAAAACw="}
                                  alt=""
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    objectFit: "cover",
                                    border: "1px solid #e5e7eb",
                                    background: "#f3f4f6",
                                  }}
                                />
                                {editing && (
                                  <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                                    {activeLanguage.dictionary.upload}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleClientLogoChange(workIndex, clientIndex)}
                                      style={{ display: "none" }}
                                    />
                                  </label>
                                )}
                              </div>
                              {editing && (
                                <Button
                                  variant="text"
                                  color="error"
                                  onClick={() =>
                                    setWorkBlocks((prev) =>
                                      prev.map((block, i) =>
                                        i === workIndex
                                          ? { ...block, clients: block.clients.filter((_, j) => j !== clientIndex) }
                                          : block
                                      )
                                    )
                                  }
                                >
                                  {activeLanguage.dictionary.remove}
                                </Button>
                              )}
                            </div>
                          ))}

                          {editing && work.clients.length === 0 && (
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{activeLanguage.dictionary.noClients ?? "No clients added."}</div>
                          )}

                          {editing && (
                            <div>
                              <Button
                                className="btn ghost"
                                onClick={() =>
                                  setWorkBlocks((prev) =>
                                    prev.map((block, i) =>
                                      i === workIndex ? { ...block, clients: [...block.clients, { name: "", logo: null }] } : block
                                    )
                                  )
                                }
                              >
                                + {activeLanguage.dictionary.client || "Add client"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {editing && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            variant="text"
                            color="error"
                            onClick={() => setWorkBlocks((prev) => prev.filter((_, i) => i !== workIndex))}
                          >
                            {activeLanguage.dictionary.remove}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {editing && (
                    <div>
                      <Button
                        className="btn ghost"
                        onClick={() =>
                          setWorkBlocks((prev) => [
                            ...prev,
                            {
                              companyName: "",
                              companyLogo: null,
                              title: "",
                              start: "",
                              end: "",
                              isCurrent: false,
                              isConsultancy: false,
                              clients: [],
                            },
                          ])
                        }
                      >
                        + {activeLanguage.dictionary.work || "Add work"}
                      </Button>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {tab === "skills" && (
              <WorkSkillsSection
                profileId={profileId}
                skills={skills}
                onSkillsChange={onSkillsChange}
                editing={editing}
                registerBeforeSave={registerBeforeSave}
              />
            )}

            {tab === "certs" && (
              <WorkSectionCerts
                activeLanguage={activeLanguage}
                editing={editing}
                resizeImageToDataUrl={resizeImageToDataUrl}
                registerBeforeSave={registerBeforeSave}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkSection;
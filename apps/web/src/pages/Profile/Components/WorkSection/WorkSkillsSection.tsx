import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, Slider, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";

type Skill = {
  id?: string;
  name: string;
  proficiency: number;
  icon?: string | null;
  order?: number;
};

type Props = {
  profileId: string;
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  editing: boolean;
  registerBeforeSave?: (fn: () => Promise<void>) => void;
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

function useInView<T extends Element>(opts: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), opts);
    io.observe(el);
    return () => io.disconnect();
  }, [opts.root, opts.rootMargin, opts.threshold]);

  return { ref, inView };
}

const WorkSkillsSection: React.FC<Props> = ({ profileId, skills, onSkillsChange, editing, registerBeforeSave }) => {
  const { activeLanguage } = useLanguage();

  const onSkillsChangeRef = useRef(onSkillsChange);
  useEffect(() => {
    onSkillsChangeRef.current = onSkillsChange;
  }, [onSkillsChange]);

  const loadedForProfileRef = useRef<string | null>(null);
  const savingRef = useRef(false);

  const inViewOpts = useMemo<IntersectionObserverInit>(() => ({ threshold: 0.25, rootMargin: "120px 0px" }), []);
  const { ref: inViewRef, inView: sectionInView } = useInView<HTMLDivElement>(inViewOpts);

  const [playedKeys, setPlayedKeys] = useState<Record<string, true>>({});
  const getKey = useCallback((s: Skill, idx: number) => (s.id ? `id:${s.id}` : `idx:${idx}`), []);

  useEffect(() => {
    if (!sectionInView) return;
    setPlayedKeys((prev) => {
      const next = { ...prev };
      (skills ?? []).forEach((s, idx) => {
        const k = getKey(s, idx);
        if (!next[k]) next[k] = true;
      });
      return next;
    });
  }, [sectionInView, skills, getKey]);

  useEffect(() => {
    setPlayedKeys({});
  }, [profileId]);

  const loadSkills = useCallback(async () => {
    if (!profileId) return;
    if (loadedForProfileRef.current === profileId) return;

    const data = await fetchApi(`/api/profile/${profileId}/skills`, { method: "GET" });
    onSkillsChangeRef.current(Array.isArray(data) ? data : []);
    loadedForProfileRef.current = profileId;
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    loadedForProfileRef.current = null;
    loadSkills().catch((e) => console.error("Failed to load skills", e));
  }, [profileId, loadSkills]);

  const saveSkillsRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    saveSkillsRef.current = async () => {
      if (!profileId) return;
      if (loadedForProfileRef.current !== profileId) return;
      if (savingRef.current) return;

      savingRef.current = true;
      try {
        const payload = (skills ?? []).map((s, idx) => ({
          id: s.id,
          name: String(s.name ?? "").trim(),
          proficiency: clamp(Number(s.proficiency ?? 0)),
          icon: s.icon ?? null,
          order: idx,
        }));

        await fetchApi(`/api/profile/${profileId}/skills`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } finally {
        savingRef.current = false;
      }
    };
  }, [profileId, skills]);

  useEffect(() => {
    if (!registerBeforeSave) return;
    const stable = async () => saveSkillsRef.current();
    registerBeforeSave(stable);
  }, [registerBeforeSave]);

  const handleAddSkill = () => {
    onSkillsChangeRef.current([...(skills ?? []), { name: "", proficiency: 60, icon: null }]);
  };

  const handleSkillChange = (index: number, patch: Partial<Skill>) => {
    const updated = [...(skills ?? [])];
    updated[index] = { ...updated[index], ...patch };
    onSkillsChangeRef.current(updated);
  };

  const handleDeleteSkill = async (index: number) => {
    const list = skills ?? [];
    const skill = list[index];

    if (skill?.id) {
      try {
        await fetchApi(`/api/profile/skills/${skill.id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Failed to delete skill", e);
      }
    }

    onSkillsChangeRef.current(list.filter((_, i) => i !== index));
  };

  const title = activeLanguage.dictionary.categories?.skills || "Skills";
  const emptyText = useMemo(() => activeLanguage.dictionary.noSkills ?? "No skills added.", [activeLanguage.dictionary]);
  const skillLabel = activeLanguage.dictionary.skill || "Skill";

  const sectionElRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const setPointerVars = (x: number, y: number, a: number) => {
    const el = sectionElRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--ma", `${a}`);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = sectionElRef.current;
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
    if (!sectionInView) setPointerVars(0, 0, 0);
  }, [sectionInView]);

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      sectionElRef.current = el;
    },
    [inViewRef]
  );

  // Scroll only the skills list area (header stays visible).
  const listMaxHeight = { xs: "none", sm: "min(56vh, 560px)" };

  return (
    <Box
      component="div"
      ref={setRefs}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      sx={{
        mb: 3,
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 0 10px rgba(0,0,0,.22)",
        overflow: "hidden",
        position: "relative",

        "--mx": "0px",
        "--my": "0px",
        "--ma": "0",

        "@keyframes wsPoofIn": {
          "0%": { transform: "translateY(10px) scale(.985)", opacity: 0, filter: "blur(2px)" },
          "60%": { transform: "translateY(-2px) scale(1.01)", opacity: 1, filter: "blur(0px)" },
          "100%": { transform: "translateY(0px) scale(1)", opacity: 1, filter: "blur(0px)" },
        },
        "@keyframes wsShimmer": {
          "0%": { transform: "translateX(-60%)" },
          "100%": { transform: "translateX(160%)" },
        },
        "@keyframes wsSpark": {
          "0%": { transform: "translateY(0px) scale(0.9)", opacity: 0 },
          "30%": { opacity: 0.85 },
          "100%": { transform: "translateY(-10px) scale(1.05)", opacity: 0 },
        },
        "@keyframes wsGradFlow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },

        "&::before": {
          content: '""',
          position: "absolute",
          inset: -6,
          background:
            "radial-gradient(900px circle at 20% 10%, rgba(99,102,241,.045), transparent 56%), radial-gradient(700px circle at 85% 30%, rgba(236,72,153,.032), transparent 55%)",
          pointerEvents: "none",
          opacity: sectionInView ? 1 : 0,
          transition: "opacity 600ms ease",
          filter: "saturate(1.01)",
        },

        "&::after": {
          content: '""',
          position: "absolute",
          inset: -2,
          pointerEvents: "none",
          opacity: "var(--ma)",
          transition: "opacity 180ms ease",
          background:
            "radial-gradient(240px circle at var(--mx) var(--my), rgba(255,255,255,.10), rgba(255,255,255,.04) 36%, transparent 64%)",
          filter: "blur(10px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            transform: sectionInView ? "translateY(0px)" : "translateY(6px)",
            opacity: sectionInView ? 1 : 0,
            transition: "transform 420ms ease, opacity 420ms ease",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: ".2px",
              lineHeight: 1.1,
              position: "relative",
              display: "inline-block",
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -6,
                height: 2,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(99,102,241,.45), rgba(236,72,153,.30), rgba(34,211,238,.26))",
                transformOrigin: "left",
                transform: sectionInView ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 520ms ease",
                opacity: 0.8,
              },
            }}
          >
            {title}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.72, display: "block", mt: 1.25 }}>
            {activeLanguage.dictionary.skillsHint || "Keep it concise. Highlight what you use most."}
          </Typography>
        </Box>

        {editing && (
          <Button
            onClick={handleAddSkill}
            startIcon={<AddRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 1.75,
              py: 1,
              textTransform: "none",
              fontWeight: 900,
              color: "var(--secondary)",
              border: "1px solid rgba(255,255,255,.14)",
              background: "rgba(255,255,255,.06)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 0 10px rgba(0,0,0,.22)",
              "&:active": { transform: "scale(.99)" },
            }}
          >
            {activeLanguage.dictionary.addSkill || "Add Skill"}
          </Button>
        )}
      </Box>

      {/* Skills list scroll container */}
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gap: 1.25,
          maxHeight: listMaxHeight,
          overflowY: { xs: "visible", sm: "auto" },
          pr: { xs: 0, sm: 0.5 },
          "&::-webkit-scrollbar": { width: 10 },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,.10)",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.10)",
          },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}
      >
        {(skills ?? []).length === 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px dashed rgba(255,255,255,.18)",
              background: "rgba(0,0,0,.10)",
              opacity: 0.85,
              transform: sectionInView ? "translateY(0px)" : "translateY(6px)",
              transition: "transform 420ms ease, opacity 420ms ease",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {emptyText}
            </Typography>
          </Box>
        )}

        {(skills ?? []).map((skill, idx) => {
          const pct = clamp(Number(skill.proficiency ?? 0));
          const key = getKey(skill, idx);
          const played = !!playedKeys[key];
          const name = String(skill.name ?? "").trim();

          const showIcon = !!skill.icon;
          const initialChar = (name || "?").trim().slice(0, 1).toUpperCase();

          return (
            <Box
              key={key}
              sx={{
                borderRadius: 2.5,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.038)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                p: 1.5,
                boxShadow: "0 0 5px rgba(0,0,0,.22)",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView ? "translateY(0px)" : "translateY(10px)",
                ...(played ? { animation: "wsPoofIn 520ms cubic-bezier(.2,.9,.2,1) both" } : {}),
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid transparent",
                    background:
                      "linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22)) padding-box," +
                      "conic-gradient(from 210deg, rgba(255,255,255,.58), rgba(255,255,255,0) 28%, rgba(255,255,255,.26) 55%, rgba(255,255,255,0) 78%, rgba(255,255,255,.46)) border-box",
                    boxShadow: "0 0 6px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.06)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background:
                        "radial-gradient(18px circle at 28% 26%, rgba(255,255,255,.12), transparent 62%)," +
                        "linear-gradient(135deg, rgba(255,255,255,.24), transparent 55%)",
                      opacity: 1,
                      pointerEvents: "none",
                      zIndex: 3,
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background:
                        "linear-gradient(120deg, rgba(255,255,255,.10), rgba(255,255,255,.04) 40%, transparent 65%)",
                      opacity: 0.65,
                      pointerEvents: "none",
                      zIndex: 4,
                    },
                  }}
                >
                  {showIcon ? (
                    <>
                      <img
                        src={skill.icon as string}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          position: "relative",
                          zIndex: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 999,
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,0) 55%), radial-gradient(16px circle at 28% 26%, rgba(255,255,255,.10), transparent 62%)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      />
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: ".6px", opacity: 0.92 }}>
                        {initialChar}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {editing ? (
                  <TextField
                    fullWidth
                    label={skillLabel}
                    value={skill.name ?? ""}
                    onChange={(e) => handleSkillChange(idx, { name: e.target.value })}
                    size="small"
                    variant="outlined"
                    sx={{
                      "& .MuiInputLabel-root": { opacity: 0.78 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(0,0,0,.18)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        "& fieldset": { borderColor: "rgba(255,255,255,.12)" },
                        "&.Mui-focused fieldset": { borderColor: "rgba(99,102,241,.55)" },
                      },
                      "& input": { color: "var(--secondary)", fontWeight: 800 },
                      "& label": { color: "rgba(255,255,255,.72)" },
                    }}
                  />
                ) : (
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 1.25,
                        mb: 0.75,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 900,
                          letterSpacing: ".2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {name || "—"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 1000,
                          letterSpacing: ".3px",
                          opacity: 0.95,
                          flex: "0 0 auto",
                          transform: played ? "translateY(0px) scale(1)" : "translateY(4px) scale(.98)",
                          transition: "transform 520ms cubic-bezier(.2,.9,.2,1), opacity 520ms ease",
                        }}
                      >
                        {pct}%
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        height: 30,
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,.10)",
                        background: "rgba(0,0,0,.22)",
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: played ? `${pct}%` : "0%",
                          borderRadius: "10px",
                          background:
                            "linear-gradient(90deg, rgba(99,102,241,.70), rgba(236,72,153,.52), rgba(34,211,238,.46))",
                          backgroundSize: "240% 240%",
                          animation: sectionInView ? "wsGradFlow 12s ease-in-out infinite" : "none",
                          transition: played ? "width 900ms cubic-bezier(.2,.9,.2,1)" : "none",
                          position: "relative",
                          overflow: "hidden",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.16) 18%, transparent 36%)",
                            opacity: 0.22,
                            transform: "translateX(-60%)",
                            animation: played ? "wsShimmer 1200ms ease 250ms both" : "none",
                          },
                        }}
                      />

                      {played && (
                        <>
                          <Box
                            sx={{
                              position: "absolute",
                              left: `calc(${Math.max(6, Math.min(94, pct))}% - 8px)`,
                              top: -7,
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              background: "rgba(255,255,255,.20)",
                              opacity: 0,
                              animation: "wsSpark 700ms ease 520ms both",
                              pointerEvents: "none",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 999,
                                background:
                                  "radial-gradient(circle at 35% 35%, rgba(255,255,255,.45), rgba(255,255,255,.08) 55%, transparent 70%)",
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              position: "absolute",
                              left: `calc(${Math.max(8, Math.min(92, pct))}% - 2px)`,
                              top: -2,
                              width: 6,
                              height: 6,
                              borderRadius: 999,
                              background: "rgba(34,211,238,.28)",
                              opacity: 0,
                              animation: "wsSpark 650ms ease 600ms both",
                              pointerEvents: "none",
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                )}

                {editing ? (
                  <IconButton
                    onClick={() => handleDeleteSkill(idx)}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(0,0,0,.22)",
                      color: "rgba(255,255,255,.85)",
                      transition: "background 160ms ease, border-color 160ms ease",
                      "&:active": { transform: "scale(.98)" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Box sx={{ width: 36 }} />
                )}
              </Box>

              {editing && (
                <Box sx={{ mt: 1.25 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 800 }}>
                      {String(skill.name ?? "").trim() || "—"}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 1000, letterSpacing: ".3px" }}>
                      {pct}%
                    </Typography>
                  </Box>

                  <Slider
                    value={pct}
                    onChange={(_, value) =>
                      handleSkillChange(idx, { proficiency: Array.isArray(value) ? value[0] : (value as number) })
                    }
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      "& .MuiSlider-rail": {
                        opacity: 1,
                        height: 12,
                        borderRadius: 999,
                        background: "rgba(255,255,255,.08)",
                        border: "1px solid rgba(255,255,255,.10)",
                      },
                      "& .MuiSlider-track": {
                        height: 12,
                        borderRadius: 999,
                        background:
                          "linear-gradient(90deg, rgba(99,102,241,.70), rgba(236,72,153,.52), rgba(34,211,238,.46))",
                        backgroundSize: "240% 240%",
                        animation: sectionInView ? "wsGradFlow 12s ease-in-out infinite" : "none",
                        border: "none",
                        boxShadow: "0 0 10px rgba(0,0,0,.22)",
                      },
                      "& .MuiSlider-thumb": {
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background: "rgba(255,255,255,.92)",
                        boxShadow: "0 0 10px rgba(0,0,0,.22)",
                        "&:active": { transform: "scale(.98)" },
                      },
                      "& .MuiSlider-valueLabel": {
                        borderRadius: 2,
                        background: "rgba(0,0,0,.62)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,.12)",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default WorkSkillsSection;
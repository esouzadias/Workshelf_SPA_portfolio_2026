import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";

type Review = {
  id: string;
  companyName: string;
  companyLogoUrl?: string | null;
  description: string;
  fileName: string;
  url: string;
  mimeType?: string;
  createdAt: string;
  reviewDate: string;
};

const API = "http://localhost:4000";
const resolveUrl = (u: string) => (u?.startsWith("/uploads") ? `${API}${u}` : u);

const toDateLabel = (iso: string, locale?: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale || undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const norm = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const DashboardReviews: React.FC = () => {
  const { activeLanguage } = useLanguage();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [visible, setVisible] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const dict: any = activeLanguage?.dictionary ?? {};
  const closeText = dict?.close ?? "Close";
  const showMoreText = dict?.showMore ?? "Show more";
  const showLessText = dict?.showLess ?? "Show less";
  const emptyText = dict?.noReviews ?? "No reviews added";

  const locale = activeLanguage?.code ?? "en";

  useEffect(() => {
    fetchApi("/users/me")
      .then((me: any) => fetchApi(`/api/profile/${me?.profile?.id}/reviews`))
      .then((data) => Array.isArray(data) && setReviews(data))
      .catch(() => {});
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
      [...(reviews ?? [])].sort(
        (a, b) => new Date(b?.reviewDate ?? 0).getTime() - new Date(a?.reviewDate ?? 0).getTime()
      ),
    [reviews]
  );

  const shown = useMemo(() => (expanded ? sorted : sorted.slice(0, 5)), [expanded, sorted]);
  const hasMore = sorted.length > 5;

  const getKey = (r: Review, idx: number) => (r.id ? `id:${r.id}` : `idx:${idx}:${norm(r.companyName)}`);

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "relative",
        p: 1.5,
        background: "transparent",
        border: "none",
        boxShadow: "none",

        "@keyframes rvIn": {
          "0%": { opacity: 0, transform: "translateY(10px) scale(.985)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "@keyframes rvSheen": {
          "0%": { transform: "translateX(-70%) rotate(12deg)" },
          "100%": { transform: "translateX(170%) rotate(12deg)" },
        },
      }}
    >
      <Box sx={{ display: "grid", gap: 1.25, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            maxHeight: expanded ? "60vh" : "none",
            overflowY: expanded ? "auto" : "visible",
            pr: expanded ? 1 : 0,
            transition: "max-height 0.3s cubic-bezier(.2,.9,.2,1)",
          }}
        >
          {shown.length === 0 ? (
            <Typography sx={{ opacity: 0.7, fontWeight: 800 }}>{emptyText}</Typography>
          ) : (
            shown.map((review, idx) => {
              const key = getKey(review, idx);
              const isOpen = openKey === key;

              return (
                <Box key={key} sx={{ display: "grid", gap: 1 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setOpenKey((cur) => (cur === key ? null : key));
                    }}
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
                        ? "linear-gradient(135deg, rgba(99,102,241,.14), rgba(34,211,238,.06))"
                        : "rgba(255,255,255,.035)",
                      boxShadow: isOpen ? "0 0 14px rgba(0,0,0,.36)" : "0 0 6px rgba(0,0,0,.22)",
                      position: "relative",
                      overflow: "hidden",

                      opacity: visible ? 1 : 0,
                      animation: visible ? `rvIn 420ms cubic-bezier(.2,.9,.2,1) ${idx * 70}ms both` : "none",
                      transition:
                        "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",

                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: -40,
                        background:
                          "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.16) 18%, transparent 36%)",
                        opacity: 0,
                        transform: "translateX(-70%) rotate(12deg)",
                        pointerEvents: "none",
                      },

                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 0 16px rgba(0,0,0,.40)",
                        borderColor: "rgba(255,255,255,.18)",
                        "&::after": { opacity: 0.24, animation: "rvSheen 900ms ease both" },
                      },
                      "&:active": { transform: "translateY(-1px) scale(.995)" },
                    }}
                  >
                    {/* LEFT: logo + text */}
                    <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", minWidth: 0 }}>
                      {review.companyLogoUrl && (
                        <Box
                          component="img"
                          src={review.companyLogoUrl}
                          alt={review.companyName}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            objectFit: "contain",
                            background: "rgba(255,255,255,.08)",
                            p: 0.5,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <Box sx={{ minWidth: 0 }}>
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
                          {review.companyName}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.4,
                            opacity: 0.7,
                            fontWeight: 800,
                            fontSize: 12.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {toDateLabel(review.reviewDate, locale)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* RIGHT: PDF tag */}
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, opacity: 0.9 }}>
                      <PictureAsPdfRoundedIcon fontSize="small" />
                      <Typography sx={{ fontWeight: 900, fontSize: 12.5, opacity: 0.85 }}>PDF</Typography>
                    </Box>
                  </Box>

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
                      <Typography
                        sx={{
                          fontWeight: 850,
                          opacity: 0.88,
                          mb: 1,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.45,
                        }}
                      >
                        {review.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setPreviewUrl(resolveUrl(review.url))}
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
                            transition:
                              "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
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
                              maxWidth: 260,
                            }}
                          >
                            {review.fileName || "Open PDF"}
                          </Typography>
                        </Box>

                        {previewUrl && (
                          <Box
                            component="button"
                            type="button"
                            onClick={() => setPreviewUrl(null)}
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
                        )}
                      </Box>

                      {previewUrl && (
                        <Box sx={{ mt: 1.25 }}>
                          <Box
                            sx={{
                              height: 420,
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,.10)",
                              background: "rgba(0,0,0,.22)",
                            }}
                          >
                            <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })
          )}
        </Box>

        {hasMore && (
          <Box
            component="button"
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              setOpenKey(null);
              setExpanded((v) => !v);
            }}
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

export default DashboardReviews;
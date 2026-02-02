// apps/web/src/Components/Dashboard/Contacts/DashboardContacts.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { fetchApi } from "../../../lib/api";
import { useLanguage } from "../../../lib/locale.context";

type ContactType =
  | "email"
  | "phone"
  | "website"
  | "linkedin"
  | "github"
  | "twitter"
  | "instagram"
  | "other";

type Contact = {
  id: string;
  type: ContactType;
  label?: string | null;
  value: string;
  icon?: string | null;
  order?: number | null;
};

const iconFor = (type: ContactType) => {
  switch (type) {
    case "email":
      return <EmailRoundedIcon fontSize="small" />;
    case "phone":
      return <PhoneRoundedIcon fontSize="small" />;
    case "website":
      return <LanguageRoundedIcon fontSize="small" />;
    case "linkedin":
      return <LinkedInIcon fontSize="small" />;
    case "github":
      return <GitHubIcon fontSize="small" />;
    case "twitter":
      return <TwitterIcon fontSize="small" />;
    case "instagram":
      return <InstagramIcon fontSize="small" />;
    default:
      return <LinkRoundedIcon fontSize="small" />;
  }
};

const norm = (s: string) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

const isProbablyUrl = (v: string) => /^https?:\/\//i.test(v.trim());
const ensureUrl = (v: string) => (isProbablyUrl(v) ? v.trim() : `https://${v.trim()}`);

const hrefFor = (c: Contact) => {
  const v = c.value?.trim() ?? "";
  if (!v) return null;

  if (c.type === "email") return `mailto:${v}`;
  if (c.type === "phone") return `tel:${v.replace(/\s+/g, "")}`;
  if (c.type === "website" || c.type === "linkedin" || c.type === "github" || c.type === "twitter" || c.type === "instagram" || c.type === "other")
    return ensureUrl(v);

  return null;
};

const DashboardContacts: React.FC = () => {
  const { activeLanguage } = useLanguage();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visible, setVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const dict: any = activeLanguage?.dictionary ?? {};
  const emptyText = dict?.noContacts ?? "No contacts added";
  const copyText = dict?.copy ?? "Copy";
  const copiedText = dict?.copied ?? "Copied";

  useEffect(() => {
    fetchApi("/users/me")
      .then((me: any) => fetchApi(`/api/profile/${me?.profile?.id}/contacts`))
      .then((data) => Array.isArray(data) && setContacts(data))
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
    return [...(contacts ?? [])]
      .filter((c) => String(c?.value ?? "").trim().length > 0)
      .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  }, [contacts]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 900);
    } catch {
      // ignore
    }
  };

  const getKey = (c: Contact, idx: number) => (c.id ? `id:${c.id}` : `idx:${idx}:${c.type}:${norm(c.value)}`);

  return (
    <Box
      ref={rootRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gap: 1.25,
        p: 1.5,
        background: "transparent",
        border: "none",
        boxShadow: "none",

        "@keyframes ctIn": {
          "0%": { opacity: 0, transform: "translateY(10px) scale(.985)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "@keyframes ctSheen": {
          "0%": { transform: "translateX(-70%) rotate(12deg)" },
          "100%": { transform: "translateX(170%) rotate(12deg)" },
        },
      }}
    >
      {sorted.length === 0 ? (
        <Typography sx={{ opacity: 0.7, fontWeight: 800 }}>{emptyText}</Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 1.25,
            alignContent: "start",
          }}
        >
          {sorted.map((c, idx) => {
            const key = getKey(c, idx);
            const href = hrefFor(c);
            const isCopied = copiedKey === key;

            return (
              <Box
                key={key}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.035)",
                  boxShadow: "0 0 8px rgba(0,0,0,.22)",
                  overflow: "hidden",
                  position: "relative",

                  opacity: visible ? 1 : 0,
                  animation: visible ? `ctIn 420ms cubic-bezier(.2,.9,.2,1) ${idx * 70}ms both` : "none",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 1.2,
                    alignItems: "center",
                    p: 1.35,
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: -40,
                      background: "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.16) 18%, transparent 36%)",
                      opacity: 0,
                      transform: "translateX(-70%) rotate(12deg)",
                      pointerEvents: "none",
                    },
                    "&:hover::after": { opacity: 0.24, animation: "ctSheen 900ms ease both" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,.12)",
                      background: "rgba(0,0,0,.12)",
                      opacity: 0.9,
                    }}
                  >
                    {iconFor(c.type)}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        letterSpacing: ".2px",
                        opacity: 0.92,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.label || c.type}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        opacity: 0.72,
                        fontWeight: 800,
                        fontSize: 12.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={c.value}
                    >
                      {c.value}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "inline-flex", gap: 0.75, alignItems: "center" }}>
                    {href && (
                      <Box
                        component="a"
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer" : undefined}
                        sx={{
                          textDecoration: "none",
                          border: "1px solid rgba(255,255,255,.12)",
                          background: "rgba(255,255,255,.04)",
                          color: "rgba(255,255,255,.86)",
                          borderRadius: 999,
                          px: 1.1,
                          py: 0.55,
                          fontWeight: 900,
                          fontSize: 12.5,
                          cursor: "pointer",
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
                        Open
                      </Box>
                    )}

                    <Box
                      component="button"
                      type="button"
                      onClick={() => copyToClipboard(c.value, key)}
                      sx={{
                        appearance: "none",
                        border: "1px solid rgba(255,255,255,.12)",
                        background: "rgba(255,255,255,.04)",
                        color: "rgba(255,255,255,.86)",
                        borderRadius: 999,
                        px: 1.0,
                        py: 0.55,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.55,
                        fontWeight: 900,
                        fontSize: 12.5,
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
                      {isCopied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                      <span style={{ opacity: isCopied ? 0.9 : 0.85 }}>{isCopied ? copiedText : copyText}</span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default DashboardContacts;
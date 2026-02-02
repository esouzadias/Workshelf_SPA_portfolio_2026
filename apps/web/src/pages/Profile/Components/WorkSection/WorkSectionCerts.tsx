import React, { useEffect, useRef, useState } from "react";
import { Box, Card, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ColorizeIcon from '@mui/icons-material/Colorize';
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { apiGet, apiPostForm, apiDelete } from "../../../../lib/api";
import { Section } from "../../../../lib/Models";
import { HexColorPicker } from "react-colorful";
import { Popper, Grow } from "@mui/material";

type Cert = {
  id: string;
  title: string;
  fileName: string;
  url: string;
  badgeColor?: string | null;
  iconUrl?: string | null;
};

type Props = {
  activeLanguage: any;
  editing: boolean;
  resizeImageToDataUrl: (file: File, maxSize?: number, quality?: number) => Promise<string>;
  onDirtyChange?: (dirty: boolean) => void;
  registerBeforeSave?: (fn: () => Promise<void>) => void;
  onSaveCertStyles?: (patches: Record<string, { badgeColor?: string | null; iconUrl?: string | null }>) => Promise<void>;
};

const API = "http://localhost:4000";
const resolveUrl = (u: string) => (u.startsWith("/uploads") ? `${API}${u}` : u);

const WorkSectionCerts: React.FC<Props> = ({
  activeLanguage,
  editing,
  resizeImageToDataUrl,
  registerBeforeSave,
  onSaveCertStyles,
}) => {
  // state
  const [certs, setCerts] = useState<Cert[]>([]);
  const [staged, setStaged] = useState<Record<string, { badgeColor?: string | null; iconUrl?: string | null }>>({});
  const [uploading, setUploading] = useState(false);
  const [openCert, setOpenCert] = useState<{ title: string; url: string; badgeColor: string } | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const pendingRef = useRef<Record<string, { badgeColor?: string | null; iconUrl?: string | null }>>({});

  // effects
  useEffect(() => {
    (async () => {
      try {
        const list = await apiGet<Cert[]>("/dashboard/certifications");
        setCerts(list);
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!registerBeforeSave) return;
    registerBeforeSave(async () => {
      if (onSaveCertStyles && Object.keys(staged).length > 0) {
        await onSaveCertStyles(staged);
      }
      setStaged({});
    });
  }, [registerBeforeSave, onSaveCertStyles, staged]);

  useEffect(() => {
    if (!registerBeforeSave) return;
    registerBeforeSave(async () => {
      const payload: Record<string, { badgeColor?: string | null; iconUrl?: string | null }> = {
        ...staged,
        ...pendingRef.current,
      };
      if (onSaveCertStyles && Object.keys(payload).length > 0) {
        await onSaveCertStyles(payload);
      }
      setStaged({});
      pendingRef.current = {};
    });
  }, [registerBeforeSave, onSaveCertStyles, staged]);

  // functions
  const handlePickPdf: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name.replace(/\.pdf$/i, ""));
      const created = await apiPostForm<Cert>("/dashboard/certifications", fd);
      setCerts((prev) => [created, ...prev]);
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    const prev = certs;
    setCerts((list) => list.filter((c) => c.id !== id));
    try {
      await apiDelete<void>(`/dashboard/certifications/${id}`);
      setStaged((s) => {
        const { [id]: _drop, ...rest } = s;
        return rest;
      });
    } catch {
      setCerts(prev);
      alert("Could not delete certificate.");
    }
  };

  const ColorDot = ({
    value,
    onChange,
    disabled,
  }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(value || "#6b7280");
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const popperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setPreview(value || "#6b7280"), [value]);

    useEffect(() => {
      const onDown = (e: PointerEvent) => {
        if (!open) return;
        const t = e.target as Node | null;
        const inAnchor = !!anchorRef.current && !!t && anchorRef.current.contains(t);
        const inPopper = !!popperRef.current && !!t && popperRef.current.contains(t);
        if (!inAnchor && !inPopper) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("keydown", onKey, true);
      return () => {
        document.removeEventListener("pointerdown", onDown, true);
        document.removeEventListener("keydown", onKey, true);
      };
    }, [open]);

    return (
      <>
        <Box
          component="button"
          ref={anchorRef}
          type="button"
          disabled={disabled}
          aria-label="badge color"
          onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen((v) => !v); }}
          sx={{
            width: 36, height: 36, borderRadius: "50%", border: "2px solid transparent", p: 0,
            backgroundColor: preview, cursor: disabled ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            transition: "box-shadow 120ms ease, border-color 120ms ease",
            "&:hover": { borderColor: "var(--primary)", boxShadow: "0 0 0 4px rgba(0,0,0,0.08)", "& .color-icon": { opacity: 1 } },
          }}
        >
          <ColorizeIcon className="color-icon" sx={{ color: "var(--primary)", opacity: 0, transition: "opacity 150ms ease", pointerEvents: "none" }} fontSize="small" />
        </Box>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          transition
          modifiers={[
            { name: "offset", options: { offset: [0, 10] } },
            { name: "preventOverflow", options: { padding: 8, altAxis: true } },
            { name: "flip", options: { padding: 8 } },
          ]}
          sx={{ zIndex: 1500 }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} timeout={220} style={{ transformOrigin: "left top" }}>
              <Box
                ref={popperRef}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: "var(--bgPrimary, #14171f)",
                  border: "1px solid rgba(148,163,184,.25)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -6, left: 12, width: 12, height: 12,
                    transform: "rotate(45deg)",
                    bgcolor: "var(--bgPrimary, #14171f)",
                    borderLeft: "1px solid rgba(148,163,184,.25)",
                    borderTop: "1px solid rgba(148,163,184,.25)",
                  },
                  "@keyframes springIn": {
                    "0%": { opacity: 0, transform: "translateY(10px) scale(0.92) rotate(-1.5deg)" },
                    "60%": { opacity: 1, transform: "translateY(0) scale(1.03) rotate(0.2deg)" },
                    "85%": { transform: "translateY(-1px) scale(0.995) rotate(0deg)" },
                    "100%": { transform: "translateY(0) scale(1) rotate(0deg)" },
                  },
                  animation: "springIn 220ms cubic-bezier(.2,.9,.15,1)",
                  backdropFilter: "blur(3px)",
                }}
              >
                <HexColorPicker
                  color={preview}
                  onChange={(c) => { setPreview(c); onChange(c); }}
                />
              </Box>
            </Grow>
          )}
        </Popper>
      </>
    );
  };

  const handlePickIcon = (id: string): React.ChangeEventHandler<HTMLInputElement> => async (e) => {
    const file = e.target.files?.[0] || null;
    e.currentTarget.value = "";
    if (!file) return;
    const dataUrl = await resizeImageToDataUrl(file, 96, 0.9);
    setStaged((s) => ({ ...s, [id]: { ...s[id], iconUrl: dataUrl } }));
  };

  const handleOpenPreview = async (item: Cert) => {
    if (item.url.startsWith("blob:")) {
      setOpenCert({ title: item.title, url: item.url, badgeColor: item.badgeColor || "var(--bgSecondary)" });
      return;
    }
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }
    try {
      const abs = resolveUrl(item.url);
      const resp = await fetch(abs, { method: "GET", credentials: "include" });
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      previewBlobUrlRef.current = blobUrl;
      setOpenCert({ title: item.title, url: blobUrl, badgeColor: item.badgeColor || "var(--bgSecondary)" });
    } catch {
      alert("Could not load preview.");
    }
  };

  // render
  return (
    <Section title={activeLanguage.dictionary.categories?.certifications ?? "Certifications"}>
      {!editing &&
        (certs.length === 0 ? (
          <div style={{ opacity: 0.6 }}>{activeLanguage.dictionary.noCertifications ?? "No certifications added."}</div>
        ) : (
          <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2, height: "100%" }}>
            {certs.map((cert) => {
              const patch = staged[cert.id] || {};
              const color = patch.badgeColor ?? cert.badgeColor ?? "var(--primaryLight, var(--third))";
              return (
                <Card
                  key={cert.id}
                  sx={{
                    borderRadius: 2,
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "var(--bgSecondary)",
                    color: "transparent",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    padding: "20px 40px",
                    background: patch.iconUrl ?? cert.iconUrl ? `url(${patch.iconUrl ?? cert.iconUrl})` : "none",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundBlendMode: "multiply",
                    "&:hover": {
                      bgcolor: "var(--bgPrimary)",
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                      color: "var(--primary)",
                      "& .cert-icon-box": { opacity: 1 },
                    },
                  }}
                  onClick={() => handleOpenPreview(cert)}
                >
                  <Box
                    className="cert-icon-box"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: color,
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <PictureAsPdfIcon fontSize="large" />
                  </Box>
                  <Typography variant="subtitle2" noWrap title={cert.title} sx={{ fontWeight: 600, wordWrap: "break-word", textWrap: "wrap" }}>
                    {cert.title}
                  </Typography>
                </Card>
              );
            })}
          </Box>
        ))}

      {editing && (
        <div style={{ gridColumn: "1 / -1" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 2,
              alignItems: "stretch",
              "& > *": { minWidth: 0 },
            }}
          >
            {/* Add Certificate Card */}
            <label style={{ cursor: uploading ? "progress" : "pointer" }}>
              <input type="file" accept="application/pdf,.pdf" onChange={handlePickPdf} style={{ display: "none" }} disabled={uploading} />
              <Card
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "var(--bgSecondary)",
                  color: "var(--primary)",
                  transition: "all 0.2s",
                  cursor: uploading ? "progress" : "pointer",
                  padding: "20px 40px",
                  "&:hover": { bgcolor: "var(--bgPrimary)", color: "var(--primary)", transform: "translateY(-2px)", boxShadow: 3 },
                }}
              >
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "var(--primaryLight, var(--third))", display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                  <AddIcon fontSize="large" />
                </Box>
                <Typography variant="body2">
                  {uploading ? activeLanguage.dictionary.uploading ?? "Uploading…" : activeLanguage.dictionary.addCertification ?? "Add certificate (PDF)"}
                </Typography>
              </Card>
            </label>

            {/* Added Certifications */}
            {certs.map((cert) => {
              const patch = staged[cert.id] || {};
              const color = patch.badgeColor ?? cert.badgeColor ?? "#6b7280";

              return (
                <Card
                  key={cert.id}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "var(--bgSecondary)",
                    color: "var(--primary)",
                    transition: "all 0.2s",
                    padding: "16px 16px 12px",
                    cursor: "default",
                    "&:hover": { bgcolor: "var(--bgPrimary)", transform: "translateY(-2px)", boxShadow: 3 },
                  }}
                >
                  <Tooltip title={activeLanguage.dictionary.remove ?? "Remove"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCert(cert.id);
                      }}
                      sx={{ position: "absolute", top: 6, right: 6, zIndex: 1, bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "rgba(255,255,255,1)" } }}
                      aria-label="delete certificate"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Box
                    sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: color, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}
                    onClick={() => handleOpenPreview(cert)}
                  >
                    <PictureAsPdfIcon fontSize="large" />
                  </Box>
                  <Typography variant="subtitle2" noWrap title={cert.title} sx={{ fontWeight: 600, wordWrap: "break-word", textWrap: "wrap" }}>
                    {cert.title}
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 8, alignItems: "center", mt: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ColorDot
                      value={
                        (pendingRef.current[cert.id]?.badgeColor ??
                          staged[cert.id]?.badgeColor ??
                          cert.badgeColor ??
                          "#6b7280")
                      }
                      onChange={(v) => {
                        const cur = pendingRef.current[cert.id] || {};
                        pendingRef.current[cert.id] = { ...cur, badgeColor: v };
                      }}
                    />
                    <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                      {activeLanguage.dictionary.uploadIcon ?? "Icon"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          e.stopPropagation();
                          handlePickIcon(cert.id)(e);
                        }}
                        style={{ display: "none" }}
                      />
                    </label>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </div>
      )}

      <Dialog open={!!openCert} onClose={() => setOpenCert(null)} fullWidth maxWidth="md">
        <DialogTitle>{openCert?.title ?? "Certificate"}</DialogTitle>
        <DialogContent dividers>
          {openCert && (
            <Box style={{ height: 600, backgroundColor: openCert?.badgeColor || "var(--bgSecondary)" }}>
              <embed src={openCert.url} type="application/pdf" width="100%" height="100%" />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
};

export default WorkSectionCerts;
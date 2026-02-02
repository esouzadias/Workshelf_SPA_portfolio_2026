import React from "react";
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useLanguage } from "../../../../lib/locale.context";
import CloseIcon from '@mui/icons-material/Close';

/* ---------- Types ---------- */
type CertItem = {
  id: string;
  title: string;
  fileName: string;
  url: string;
  badgeColor?: string | null;
  iconUrl?: string | null;
};

/* ---------- API helpers ---------- */
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// use the real key from localStorage
const TOKEN_KEY = "ws_token";

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem(TOKEN_KEY);
  const h = new Headers();
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
};

async function listCertificates(): Promise<CertItem[]> {
  return fetch(`${API}/dashboard/certifications`, {
    headers: authHeaders(),
    credentials: "include", // fine to keep; harmless if you’re not using cookies
  }).then(r => {
    if (!r.ok) throw new Error("list failed");
    return r.json();
  });
}

const resolveUrl = (u: string) => (u.startsWith("/uploads") ? `${API}${u}` : u);

/* ---------- Component ---------- */
interface DashboardCertificationsProps {
  /* optionally pre-hydrate from server-side fetch */
  initial?: CertItem[];
}

const DashboardCertifications: React.FC<DashboardCertificationsProps> = ({ initial }) => {
  const { activeLanguage } = useLanguage();
  const [items, setItems] = React.useState<CertItem[]>(initial ?? []);
  const [openItem, setOpenItem] = React.useState<{ title: string; url: string, badgeColor: string, iconUrl: string } | null>(null);
  const previewBlobUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    listCertificates()
      .then(setItems)
      .catch(() => { });
  }, []);

  // preview PDF (use blob so strict Helmet/CORP still works)
  const openPreview = async (item: CertItem) => {
    try {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
      const abs = resolveUrl(item.url);
      const resp = await fetch(abs);
      if (!resp.ok) throw new Error(String(resp.status));
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      previewBlobUrlRef.current = blobUrl;
      setOpenItem({ title: item.title, url: blobUrl, badgeColor: item.badgeColor || "var(--bgSecondary)", iconUrl: blobUrl });
    } catch {
      // silent fail; you can toast if you prefer
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current);
    };
  }, []);

  return (
    <Box id="qprofile">
      {items.length === 0 ? (
        <div style={{ opacity: 0.6 }}>
          {activeLanguage.dictionary.noCertifications ?? "No certifications added."}
        </div>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 2,
            "& > *": { minWidth: 0 },
          }}
        >
          {items.map((c) => (
            <Card
              key={c.id}
              onClick={() => openPreview(c)}
              sx={{
                borderRadius: 2,
                height: 160,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "start",
                bgcolor: "var(--bgSecondary)",
                color: "var(--primary)",
                transition: "all 0.2s",
                cursor: "pointer",
                // padding: "20px 40px",
                backgroundImage: c.iconUrl ? `url(${c.iconUrl})` : 'none',
                // backgroundBlendMode: 'multiply',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                "&:hover": {
                  bgcolor: "var(--bgPrimary)",
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
              }}
            >
              {/* <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: c.badgeColor || "var(--primaryLight, var(--third))",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                {c.iconUrl ? (
                  <img
                    src={c.iconUrl}
                    alt=""
                    style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <></>
                )}
              <PictureAsPdfIcon fontSize="large" />
              </Box> */}
              <Box sx={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 1)', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  title={c.title}
                  sx={{ fontWeight: 600, wordWrap: "break-word", textWrap: "wrap", color: c.badgeColor || "var(--primary)" }}
                >
                  {c.title}
                </Typography>

              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Preview dialog */}
      <Dialog open={!!openItem} onClose={() => setOpenItem(null)} fullWidth maxWidth="md">
        <span>
          <DialogTitle>{openItem?.title ?? "Certificate"}</DialogTitle>
          <IconButton onClick={() => setOpenItem(null)} size="small" className="qprofile__close" aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </span>
        <DialogContent dividers>
          {openItem && (
            <div>
              <Box sx={{ height: 600, backgroundColor: openItem?.badgeColor || "var(--bgSecondary)" }}>
                <embed src={openItem.url} type="application/pdf" width="100%" height="100%" />
              </Box>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardCertifications;
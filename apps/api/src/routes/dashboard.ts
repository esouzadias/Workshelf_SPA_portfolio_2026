import { Router } from "express";
import path from "path";
import multer from "multer";
import { getDashboard } from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { listCerts, createCert, deleteCert } from "../services/certifications.service";

const r = Router();

// keep existing
r.get("/", getDashboard);

// ---- Certifications ----
const uploadDir = path.resolve(__dirname, "../public/uploads/certifications");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error("PDF only"));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

// GET
r.get("/certifications", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const items = await listCerts(userId);
    res.json(items);
  } catch (e) { next(e); }
});

// POST (now supports optional badgeColor and iconUrl)
r.post("/certifications", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });

    const userId = (req as any).userId;
    const title = (req.body?.title || req.file.originalname.replace(/\.pdf$/i, "")) as string;
    const relUrl = `/uploads/certifications/${req.file.filename}`;

    // Optional extras
    const badgeColor = (typeof req.body?.badgeColor === "string" && req.body.badgeColor.trim()) ? req.body.badgeColor.trim() : null;
    const iconUrl    = (typeof req.body?.iconUrl === "string" && req.body.iconUrl.trim()) ? req.body.iconUrl.trim() : null;

    const created = await createCert(userId, {
      title,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype || "application/pdf",
      url: relUrl,
      badgeColor,
      iconUrl,
    });

    res.status(201).json(created);
  } catch (e) { next(e); }
});

// DELETE
r.delete("/certifications/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    await deleteCert(userId, req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;
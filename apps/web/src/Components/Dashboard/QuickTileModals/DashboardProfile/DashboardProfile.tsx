import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./DashboardProfile.styles.less";
import { fetchApi } from "../../../../lib/api";
import { useLanguage } from "../../../../lib/locale.context";

/* ---------- Types ---------- */

type Profile = {
  id?: string;

  fullName?: string;
  displayName?: string;
  avatarUrl?: string | null;

  gender?: string;
  nationality?: string;
  birthDate?: string | null;

  employmentStatus?: string;
  currentTitle?: string;

  currentCompany?: string;
  currentCompanyLogoUrl?: string | null;

  currentClient?: string;
  currentClientLogoUrl?: string | null;

  currentRoleStart?: string | null;

  // backend may still provide these, but we won't rely on them
  education?: string;
  school?: string;
  schoolLogoUrl?: string | null;
  degree?: string;
};

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

export type DashboardProfileProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  profile: Profile;
};

const yearsSince = (iso?: string | null) => {
  if (!iso) return null;
  const diff = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(diff * 10) / 10);
};

const ageFrom = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
};

const pickLatestEducation = (list: Education[]) => {
  const items = Array.isArray(list) ? [...list] : [];
  items.sort((a, b) => {
    if (!!a.isCurrent !== !!b.isCurrent) return a.isCurrent ? -1 : 1;

    const ae = a.endDate ? new Date(a.endDate).getTime() : -Infinity;
    const be = b.endDate ? new Date(b.endDate).getTime() : -Infinity;
    if (be !== ae) return be - ae;

    const as = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
    const bs = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
    return bs - as;
  });
  return items[0] ?? null;
};

const OrgInline: React.FC<{ logo?: string | null; name?: string }> = ({ logo, name }) => (
  <span className="qprofile__orgInline">
    {logo ? (
      <img src={logo} alt="" />
    ) : (
      <span className="fallback">{(name ?? "—").slice(0, 2).toUpperCase()}</span>
    )}
    <strong>{name ?? "—"}</strong>
  </span>
);

const DashboardProfile: React.FC<DashboardProfileProps> = ({ open, onClose, title = "Profile", profile, }) => {
  const { activeLanguage } = useLanguage();
  const [tab, setTab] = useState(0);

  const age = useMemo(() => ageFrom(profile.birthDate), [profile.birthDate]);
  const yrsInRole = useMemo(() => yearsSince(profile.currentRoleStart), [profile.currentRoleStart]);

  const pillClass =
    (profile.employmentStatus || "").toLowerCase() === "employed"
      ? "qprofile__pill qprofile__pill--success"
      : "qprofile__pill";

  // Latest education only (fetched)
  const [eduLoading, setEduLoading] = useState(false);
  const [latestEdu, setLatestEdu] = useState<Education | null>(null);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setEduLoading(true);

        // We need profileId to fetch educations.
        // Prefer prop profile.id if present, otherwise fetch /users/me.
        let profileId = profile?.id;

        if (!profileId) {
          const me: any = await fetchApi("/users/me");
          profileId = me?.profile?.id;
        }

        if (!profileId) {
          setLatestEdu(null);
          return;
        }

        const eduData = await fetchApi(`/api/profile/${profileId}/educations`);
        const list = Array.isArray(eduData) ? (eduData as Education[]) : [];
        setLatestEdu(pickLatestEducation(list));
      } catch {
        setLatestEdu(null);
      } finally {
        setEduLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      keepMounted
      classes={{ paper: "qprofile__dialog qprofile__dialog--spring" }}
    >
      <div id="qprofile">
        <DialogTitle className="qprofile__titlebar">
          <div className="qprofile__header">
            <Avatar src={profile.avatarUrl ?? undefined} className="qprofile__avatar" />
            <div className="qprofile__titleGroup">
              <Typography className="qprofile__title">
                {profile.fullName ?? profile.displayName ?? title}
              </Typography>

              {profile.currentTitle && (
                <Typography className="qprofile__role">{profile.currentTitle}</Typography>
              )}

              <div className="qprofile__metaRow">
                {profile.employmentStatus && (
                  <Chip size="small" className={pillClass} label={profile.employmentStatus} />
                )}

                <span className="qprofile__orgLine">
                  {profile.currentCompany && (
                    <OrgInline logo={profile.currentCompanyLogoUrl} name={profile.currentCompany} />
                  )}
                  {profile.currentCompany && profile.currentClient && <span className="sep">•</span>}
                  {profile.currentClient && (
                    <OrgInline logo={profile.currentClientLogoUrl} name={profile.currentClient} />
                  )}
                  {yrsInRole != null && <span className="muted"> · {yrsInRole} {activeLanguage.dictionary.yearsInCurrentRole}</span>}
                </span>
              </div>
            </div>
          </div>

          <IconButton onClick={onClose} size="small" className="qprofile__close" aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="qprofile__content">
          <Tabs
            className="qprofile__tabs"
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab className="qprofile__tab" label={activeLanguage.dictionary.general} />
            <Tab className="qprofile__tab" label={activeLanguage.dictionary.work} />
            <Tab className="qprofile__tab" label={activeLanguage.dictionary.education} />
          </Tabs>

          <div className={`qprofile__panel ${tab === 0 ? "is-active" : ""}`}>
            <div className="qprofile__section surface">
              <Typography className="qprofile__sectionTitle">{activeLanguage.dictionary.identity}</Typography>
              <div className="qprofile__fields">
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.fullName}</span>
                  <strong>{profile.fullName ?? profile.displayName ?? "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.gender}</span>
                  <strong>{activeLanguage.dictionary[profile.gender] ?? "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.nationality}</span>
                  <strong>{profile.nationality && profile.nationality == "Portuguese" ? activeLanguage.dictionary.ptLang : profile.nationality == "English" ? activeLanguage.dictionary.enLang : "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.age}</span>
                  <strong>{age != null ? age : "—"} {activeLanguage.dictionary.years}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.birthDate}</span>
                  <strong>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : "—"}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className={`qprofile__panel ${tab === 1 ? "is-active" : ""}`}>
            <div className="qprofile__section surface">
              <Typography className="qprofile__sectionTitle">{activeLanguage.dictionary.workStatus}</Typography>
              <div className="qprofile__fields">
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.employmentStatus}</span>
                  <strong>{profile.employmentStatus ?? "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.currentTitle}</span>
                  <strong>{profile.currentTitle ?? "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.company}</span>
                  <strong>{profile.currentCompany ?? activeLanguage.dictionary.unemployed}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.client}</span>
                  <strong>{profile.currentClient ?? "—"}</strong>
                </div>
                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.yearsInCurrentRole}</span>
                  <strong>{yrsInRole != null ? `${yrsInRole} ${activeLanguage.dictionary.years}` : "—"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Latest education only */}
          <div className={`qprofile__panel ${tab === 2 ? "is-active" : ""}`}>
            <div className="qprofile__section surface">
              <Typography className="qprofile__sectionTitle">{activeLanguage.dictionary.education}</Typography>

              <div className="qprofile__fields">
                <div className="qprofile__field" id="qprofile_school">
                  <span>{activeLanguage.dictionary.school}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong>
                      {eduLoading ? "—" : latestEdu?.school ? latestEdu.school : "—"}
                    </strong>
                    {!eduLoading && latestEdu?.schoolLogoUrl ? (
                      <img
                        style={{ width: "28px", height: "auto", borderRadius: "100%" }}
                        src={latestEdu.schoolLogoUrl}
                        alt=""
                      />
                    ) : null}
                  </span>
                </div>

                <div className="qprofile__field">
                  <span>{activeLanguage.dictionary.degree}</span>
                  <strong>{eduLoading ? "—" : latestEdu?.degree ?? "—"}</strong>
                </div>

                {(latestEdu?.education ?? null) && (
                  <div className="qprofile__field">
                    <span>{activeLanguage.dictionary.education}</span>
                    <strong>{latestEdu?.education}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default DashboardProfile;
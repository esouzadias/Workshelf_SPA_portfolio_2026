import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Profile.styles.less";

import { useAuth } from "../../../../lib/auth.context";
import { apiPut, apiPost, apiDelete, fetchApi } from "../../../../lib/api";
import { applyTheme } from "../../../../lib/theme";
import { useLanguage } from "../../../../lib/locale.context";

import { Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {
  SportsEsportsRounded,
  CodeRounded,
  FlightRounded,
  MusicNoteRounded,
  BrushRounded,
  CameraAltRounded,
  SchoolRounded,
  FitnessCenterRounded,
  RestaurantRounded,
  BookRounded,
  EmojiObjectsRounded,
} from "@mui/icons-material";

import EditIcon from "@mui/icons-material/Edit";

import WorkSection from "../../Components/WorkSection/WorkSection";
import EducationSection from "../../Components/EducationSection";
import PersonalSection from "../../Components/PersonalSection/PersonalSection";
import AccountSection from "../../Components/AccountSection";
import HobbyEditor from "../../Components/HobbyEditor";
import ProfileBasics from "../../Components/ProfileBasics";

type ThemeChoice = "system" | "light" | "dark";
type LocaleCode = "en" | "pt";

type Hobby = { id?: string; name: string; description?: string | null; icon?: string | null };
type UserProfile = {
  id?: string;
  displayName?: string | null;
  theme?: ThemeChoice | null;
  locale?: LocaleCode | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  nationality?: string | null;
  employmentStatus?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  currentClient?: string | null;
  currentRoleStart?: string | null;
  currentCompanyLogoUrl?: string | null;
  currentClientLogoUrl?: string | null;
  education?: string | null;
  school?: string | null;
  schoolLogoUrl?: string | null;
  degree?: string | null;
  maritalStatus?: string | null;
  dependents?: number | null;
  hobbies?: Hobby[];
};
type User = { id: string; email: string; profile?: UserProfile | null };

type WorkClient = { name: string; logo: string | null };
type WorkBlock = {
  companyName: string;
  companyLogo: string | null;
  title: string;
  start: string;
  end: string;
  isCurrent: boolean;
  isConsultancy: boolean;
  clients: WorkClient[];
};

type Skill = {
  id?: string;
  name: string;
  proficiency: number;
  icon?: string | null;
  order?: number;
};

type ProfileForm = {
  displayName: string;
  theme: ThemeChoice;
  locale: LocaleCode;
  email: string;
  fullName: string;
  birthDate: string;
  gender: string;
  nationality: string;
  currentTitle: string;
  currentCompany: string;
  currentClient: string;
  currentRoleStart: string;
  education: string;
  school: string;
  schoolLogoUrl: string | null;
  degree: string;
  maritalStatus: string;
  dependents: number;
  avatarRemoved: boolean;
  avatarDataUrl: string | null;
  companyLogoUrl: string | null;
  clientLogoUrl: string | null;
  companyLogoDataUrl: string | null;
  clientLogoDataUrl: string | null;
  hobbies: Hobby[];
  employmentStatus: string | null;
  workBlocks: WorkBlock[];
  skills: Skill[];
};

const ICON_CATALOG: { key: string; label: string; el: React.ReactNode }[] = [
  { key: "gaming", label: "Gaming", el: <SportsEsportsRounded /> },
  { key: "code", label: "Code", el: <CodeRounded /> },
  { key: "travel", label: "Travel", el: <FlightRounded /> },
  { key: "music", label: "Music", el: <MusicNoteRounded /> },
  { key: "art", label: "Art", el: <BrushRounded /> },
  { key: "photo", label: "Photo", el: <CameraAltRounded /> },
  { key: "school", label: "School", el: <SchoolRounded /> },
  { key: "fitness", label: "Fitness", el: <FitnessCenterRounded /> },
  { key: "cooking", label: "Cooking", el: <RestaurantRounded /> },
  { key: "books", label: "Books", el: <BookRounded /> },
  { key: "idea", label: "Idea", el: <EmojiObjectsRounded /> },
];

const iconByKey = (k?: string | null) =>
  ICON_CATALOG.find((i) => i.key === (k || "").toLowerCase())?.el ?? <EmojiObjectsRounded />;

type TabKey = "profile" | "work" | "education" | "personal" | "account";

const ProfileMobile: React.FC = () => {
  const { user, refresh } = useAuth();
  const { activeLanguage } = useLanguage();

  const [tab, setTab] = useState<TabKey>("profile");
  const [editing, setEditing] = useState(false);
  const beforeSaveHooks = useRef<Array<() => Promise<void>>>([]);

  const profileId = ((user as User | null)?.profile?.id ?? "") as string;

  const initial = useMemo(() => {
    const p = (user as User | null)?.profile ?? {};
    return {
      displayName: (p.displayName ?? "") as string,
      theme: (p.theme ?? "system") as ThemeChoice,
      locale: (p.locale ?? "en") as LocaleCode,
      email: (user as User | null)?.email ?? "",
      hadAvatar: Boolean(p.avatarUrl),
      fullName: p.fullName ?? "",
      birthDate: p.birthDate ? p.birthDate.slice(0, 10) : "",
      gender: p.gender ?? "",
      nationality: p.nationality ?? "",
      employmentStatus: p.employmentStatus ?? "",
      currentTitle: p.currentTitle ?? "",
      currentCompany: p.currentCompany ?? "",
      currentClient: p.currentClient ?? "",
      currentRoleStart: p.currentRoleStart ? p.currentRoleStart.slice(0, 10) : "",
      currentCompanyLogoUrl: p.currentCompanyLogoUrl ?? "",
      currentClientLogoUrl: p.currentClientLogoUrl ?? "",
      education: p.education ?? "",
      school: p.school ?? "",
      schoolLogoUrl: p.schoolLogoUrl ?? "",
      degree: p.degree ?? "",
      maritalStatus: p.maritalStatus ?? "",
      dependents: p.dependents ?? 0,
      hobbies: (p.hobbies ?? []) as Hobby[],
      avatarUrl: p.avatarUrl ?? null,
    };
  }, [user]);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [theme, setTheme] = useState<ThemeChoice>(initial.theme);
  const [locale, setLocale] = useState<LocaleCode>(initial.locale);
  const [email, setEmail] = useState(initial.email);

  const [fullName, setFullName] = useState(initial.fullName);
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [gender, setGender] = useState(initial.gender);
  const [nationality, setNationality] = useState(initial.nationality);

  const [employmentStatus, setEmploymentStatus] = useState<string | null>(initial.employmentStatus ?? "");

  const [workBlocks, setWorkBlocks] = useState<WorkBlock[]>(() =>
    initial.currentCompany || initial.currentTitle || initial.currentRoleStart
      ? [
          {
            companyName: initial.currentCompany || "",
            companyLogo: initial.currentCompanyLogoUrl || null,
            title: initial.currentTitle || "",
            start: initial.currentRoleStart || "",
            end: "",
            isCurrent: true,
            isConsultancy: Boolean(initial.currentClient),
            clients: initial.currentClient
              ? [{ name: initial.currentClient, logo: initial.currentClientLogoUrl || null }]
              : [],
          },
        ]
      : []
  );

  const [education, setEducation] = useState(initial.education);
  const [school, setSchool] = useState(initial.school);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>((initial.schoolLogoUrl as any) || null);
  const [degree, setDegree] = useState(initial.degree);

  const [maritalStatus, setMaritalStatus] = useState(initial.maritalStatus);
  const [dependents, setDependents] = useState<number>(initial.dependents ?? 0);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  const [hobbies, setHobbies] = useState<Hobby[]>(initial.hobbies);
  const [baselineHobbies, setBaselineHobbies] = useState<Hobby[]>(initial.hobbies);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const onSkillsChange = (next: Skill[]) => setSkills(next);

  const [saving, setSaving] = useState(false);
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [profileEnums, setProfileEnums] = useState<any>({ gender: [], maritalStatus: [], employmentStatus: [] });

  const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a && b && typeof a === "object") {
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
        return true;
      }
      const ak = Object.keys(a);
      const bk = Object.keys(b);
      if (ak.length !== bk.length) return false;
      for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
      return true;
    }
    return false;
  };

  const makeFormSnapshot = (): ProfileForm => ({
    displayName,
    theme,
    locale,
    email,
    fullName,
    birthDate,
    gender,
    nationality,
    currentTitle: "",
    currentCompany: "",
    currentClient: "",
    currentRoleStart: "",
    education,
    school,
    schoolLogoUrl,
    degree,
    maritalStatus,
    dependents,
    avatarRemoved,
    avatarDataUrl,
    companyLogoUrl: null,
    clientLogoUrl: null,
    companyLogoDataUrl: null,
    clientLogoDataUrl: null,
    hobbies,
    employmentStatus,
    workBlocks,
    skills,
  });

  const initialSnapRef = useRef<ProfileForm>(makeFormSnapshot());

  useEffect(() => {
    fetchApi("/users/profile-options").then(setProfileEnums).catch(() => {});
  }, []);

  useEffect(() => {
    const nextWorkBlocks =
      initial.currentCompany || initial.currentTitle || initial.currentRoleStart
        ? [
            {
              companyName: initial.currentCompany || "",
              companyLogo: initial.currentCompanyLogoUrl || null,
              title: initial.currentTitle || "",
              start: initial.currentRoleStart || "",
              end: "",
              isCurrent: true,
              isConsultancy: Boolean(initial.currentClient),
              clients: initial.currentClient
                ? [{ name: initial.currentClient, logo: initial.currentClientLogoUrl || null }]
                : [],
            } as WorkBlock,
          ]
        : ([] as WorkBlock[]);

    setDisplayName(initial.displayName);
    setTheme(initial.theme);
    setLocale(initial.locale);
    setEmail(initial.email);
    setFullName(initial.fullName);
    setBirthDate(initial.birthDate);
    setGender(initial.gender);
    setNationality(initial.nationality);
    setEmploymentStatus(initial.employmentStatus);
    setEducation(initial.education);
    setSchool(initial.school);
    setSchoolLogoUrl((initial.schoolLogoUrl as any) || null);
    setDegree(initial.degree);
    setMaritalStatus(initial.maritalStatus);
    setDependents(initial.dependents ?? 0);
    setAvatarPreview(null);
    setAvatarRemoved(false);
    setAvatarDataUrl(null);
    setHobbies(initial.hobbies);
    setWorkBlocks(nextWorkBlocks);
    setSkills([]);

    initialSnapRef.current = {
      displayName: initial.displayName,
      theme: initial.theme,
      locale: initial.locale,
      email: initial.email,
      fullName: initial.fullName,
      birthDate: initial.birthDate,
      gender: initial.gender,
      nationality: initial.nationality,
      currentTitle: "",
      currentCompany: "",
      currentClient: "",
      currentRoleStart: "",
      education: initial.education,
      school: initial.school,
      schoolLogoUrl: (initial.schoolLogoUrl as any) || null,
      degree: initial.degree,
      maritalStatus: initial.maritalStatus,
      dependents: initial.dependents ?? 0,
      avatarRemoved: false,
      avatarDataUrl: null,
      companyLogoUrl: null,
      clientLogoUrl: null,
      companyLogoDataUrl: null,
      clientLogoDataUrl: null,
      hobbies: initial.hobbies,
      employmentStatus: initial.employmentStatus ?? "",
      workBlocks: nextWorkBlocks,
      skills: [],
    };
  }, [initial]);

  useEffect(() => {
    let alive = true;
    if ((baselineHobbies?.length ?? 0) === 0) {
      fetchApi<{ profile?: { hobbies?: Hobby[] } }>("/users/me")
        .then((me) => {
          if (!alive) return;
          const list = me.profile?.hobbies ?? [];
          setHobbies(list);
          setBaselineHobbies(list);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [baselineHobbies?.length, user?.id]);

  const currentSnap = makeFormSnapshot();
  const hasProfileChanges = useMemo(() => !deepEqual(currentSnap, initialSnapRef.current), [currentSnap]);
  const hasAuthChanges = email !== initial.email || newPwd.trim().length > 0;
  const canSave = editing && (hasProfileChanges || hasAuthChanges);

  const registerBeforeSave = (fn: () => Promise<void>) => {
    if (!beforeSaveHooks.current.includes(fn)) beforeSaveHooks.current.push(fn);
  };

  const resizeImageToDataUrl = (file: File, maxSize = 256, quality = 0.8): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas not supported");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const deriveCurrentWork = () => {
    const pick = workBlocks.find((w) => w.isCurrent) ?? workBlocks[0] ?? null;
    if (!pick) {
      return {
        currentTitle: null as string | null,
        currentCompany: null as string | null,
        currentRoleStart: null as string | null,
        currentCompanyLogoUrl: null as string | null,
        currentClient: null as string | null,
        currentClientLogoUrl: null as string | null,
      };
    }

    const client = pick.isConsultancy ? pick.clients?.[0] ?? null : null;

    return {
      currentTitle: pick.title?.trim() || null,
      currentCompany: pick.companyName?.trim() || null,
      currentRoleStart: pick.start ? new Date(pick.start).toISOString() : null,
      currentCompanyLogoUrl: pick.companyLogo || null,
      currentClient: client?.name?.trim() || null,
      currentClientLogoUrl: client?.logo || null,
    };
  };

  const cancelEdit = () => {
    const nextWorkBlocks =
      initial.currentCompany || initial.currentTitle || initial.currentRoleStart
        ? [
            {
              companyName: initial.currentCompany || "",
              companyLogo: initial.currentCompanyLogoUrl || null,
              title: initial.currentTitle || "",
              start: initial.currentRoleStart || "",
              end: "",
              isCurrent: true,
              isConsultancy: Boolean(initial.currentClient),
              clients: initial.currentClient
                ? [{ name: initial.currentClient, logo: initial.currentClientLogoUrl || null }]
                : [],
            } as WorkBlock,
          ]
        : ([] as WorkBlock[]);

    setDisplayName(initial.displayName);
    setTheme(initial.theme);
    setLocale(initial.locale);
    setEmail(initial.email);
    setFullName(initial.fullName);
    setBirthDate(initial.birthDate);
    setGender(initial.gender);
    setNationality(initial.nationality);
    setEmploymentStatus(initial.employmentStatus);
    setEducation(initial.education);
    setSchool(initial.school);
    setDegree(initial.degree);
    setMaritalStatus(initial.maritalStatus);
    setDependents(initial.dependents ?? 0);
    setCurrentPwd("");
    setNewPwd("");
    setAvatarPreview(null);
    setAvatarRemoved(false);
    setAvatarDataUrl(null);
    setHobbies(baselineHobbies);
    setWorkBlocks(nextWorkBlocks);
    setEditing(false);
  };

  const saveHobby = async (h: Hobby) => {
    if (h.id) {
      await apiPut(
        `/hobbies/${h.id}`,
        { name: h.name, description: h.description ?? null, icon: h.icon ?? null },
        { softAuth: true }
      );
    } else {
      const created = (await apiPost(
        `/hobbies`,
        { name: h.name, description: h.description ?? null, icon: h.icon ?? null },
        { softAuth: true }
      )) as any;
      h.id = created?.id ?? h.id;
    }
  };

  const deleteHobby = async (id: string) => {
    await apiDelete(`/hobbies/${id}`, { softAuth: true });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    if (!displayName.trim()) {
      setErrMsg(activeLanguage.dictionary.displayNameRequired ?? "Display name is required.");
      setErrOpen(true);
      return;
    }

    const willChangeEmail = email !== initial.email;
    const willChangePwd = newPwd.trim().length > 0;

    if ((willChangeEmail || willChangePwd) && !currentPwd) {
      setErrMsg(activeLanguage.dictionary.currentPasswordRequired ?? "Current password is required.");
      setErrOpen(true);
      return;
    }

    setSaving(true);
    try {
      for (const fn of beforeSaveHooks.current) await fn();
      beforeSaveHooks.current = [];

      const work = deriveCurrentWork();

      const body: any = {
        displayName: displayName.trim(),
        theme,
        locale,
        fullName: fullName.trim() || null,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        gender: gender || null,
        nationality: nationality.trim() || null,
        employmentStatus: employmentStatus || null,
        currentTitle: work.currentTitle,
        currentCompany: work.currentCompany,
        currentClient: work.currentClient,
        currentRoleStart: work.currentRoleStart,
        currentCompanyLogoUrl: work.currentCompanyLogoUrl,
        currentClientLogoUrl: work.currentClientLogoUrl,
        education: education.trim() || null,
        school: school.trim() || null,
        degree: degree.trim() || null,
        maritalStatus: maritalStatus || null,
        dependents: Number.isFinite(dependents) ? Number(dependents) : null,
      };

      if (avatarDataUrl) body.avatarUrl = avatarDataUrl;

      await apiPut("/users/profile", body, { softAuth: true });

      if (avatarRemoved && !avatarDataUrl) await apiDelete("/users/avatar", { softAuth: true });

      if (!deepEqual(initial.hobbies, hobbies)) {
        const removed = (initial.hobbies || []).filter((ih) => !hobbies.some((h) => h.id === ih.id));
        for (const r of removed) if (r.id) await deleteHobby(r.id);
        for (const h of hobbies) await saveHobby(h);
      }

      if (willChangeEmail) {
        await apiPost(
          "/auth/change-email",
          { newEmail: email.trim().toLowerCase(), password: currentPwd },
          { softAuth: true }
        );
      }
      if (willChangePwd) {
        await apiPost(
          "/auth/change-password",
          { currentPassword: currentPwd, newPassword: newPwd },
          { softAuth: true }
        );
      }

      await refresh();
      applyTheme(theme);
      setBaselineHobbies(hobbies);

      setOkMsg(activeLanguage.dictionary.profileUpdated ?? "Profile updated.");
      setOkOpen(true);

      setEditing(false);
      setCurrentPwd("");
      setNewPwd("");
      setAvatarPreview(null);
      setAvatarRemoved(false);
      setAvatarDataUrl(null);

      initialSnapRef.current = makeFormSnapshot();
    } catch (ex: any) {
      setErrMsg(ex?.message || activeLanguage.dictionary.unknownError || "Unknown error");
      setErrOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">{activeLanguage.dictionary.loginRequired}</div>
      </div>
    );
  }

  const tabButtons: Array<{ key: TabKey; label: string }> = [
    { key: "profile", label: activeLanguage.dictionary.profile ?? "Profile" },
    { key: "work", label: activeLanguage.dictionary.work ?? "Work" },
    { key: "education", label: activeLanguage.dictionary.education ?? "Education" },
    { key: "personal", label: activeLanguage.dictionary.personal ?? "Personal" },
    { key: "account", label: activeLanguage.dictionary.account ?? "Account" },
  ];

  return (
    <main style={{ width: "100%" }}>
      <div className="container">
        <form className="card form-grid" onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {tabButtons.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={{
                  flex: "0 0 auto",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,.25)",
                  background: tab === t.key ? "rgba(148,163,184,.18)" : "transparent",
                  color: "inherit",
                  cursor: tab === t.key ? "default" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "profile" && (
            <ProfileBasics
              activeLanguage={activeLanguage}
              editing={editing}
              setEditing={setEditing}
              profileEnums={profileEnums}
              user={user}
              resizeImageToDataUrl={resizeImageToDataUrl}
              setOkMsg={setOkMsg}
              setOkOpen={setOkOpen}
              setErrMsg={setErrMsg}
              setErrOpen={setErrOpen}
              setAvatarDataUrl={setAvatarDataUrl}
              setAvatarPreview={setAvatarPreview}
              hadAvatar={initial.hadAvatar}
              avatarPreview={avatarPreview}
              avatarRemoved={avatarRemoved}
              setAvatarRemoved={setAvatarRemoved}
              displayName={displayName}
              setDisplayName={setDisplayName}
              fullName={fullName}
              setFullName={setFullName}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              gender={gender}
              setGender={setGender}
              nationality={nationality}
              setNationality={setNationality}
            />
          )}

          {tab === "work" && (
            <WorkSection
              activeLanguage={activeLanguage}
              editing={editing}
              employmentStatus={employmentStatus}
              setEmploymentStatus={setEmploymentStatus}
              profileEnums={profileEnums}
              workBlocks={workBlocks}
              setWorkBlocks={setWorkBlocks}
              resizeImageToDataUrl={resizeImageToDataUrl}
              registerBeforeSave={registerBeforeSave}
              skills={skills}
              onSkillsChange={onSkillsChange}
              profileId={profileId}
            />
          )}

          {tab === "education" && (
            <EducationSection
              activeLanguage={activeLanguage}
              editing={editing}
              education={education}
              setEducation={setEducation}
              school={school}
              setSchool={setSchool}
              degree={degree}
              setDegree={setDegree}
              schoolLogoUrl={schoolLogoUrl}
              setSchoolLogoUrl={setSchoolLogoUrl}
              resizeImageToDataUrl={resizeImageToDataUrl}
            />
          )}

          {tab === "personal" && (
            <PersonalSection
              activeLanguage={activeLanguage}
              editing={editing}
              maritalStatus={maritalStatus}
              setMaritalStatus={setMaritalStatus}
              dependents={dependents}
              setDependents={setDependents}
              profileEnums={profileEnums}
              hobbies={hobbies}
              setHobbies={setHobbies}
              setEditingHobby={setEditingHobby}
              iconByKey={iconByKey}
              languages={(user as any)?.profile?.languages || []}
            />
          )}

          {tab === "account" && (
            <AccountSection
              activeLanguage={activeLanguage}
              editing={editing}
              email={email}
              setEmail={setEmail}
              currentPwd={currentPwd}
              setCurrentPwd={setCurrentPwd}
              newPwd={newPwd}
              setNewPwd={setNewPwd}
              locale={locale}
              setLocale={setLocale}
              theme={theme}
              setTheme={setTheme}
            />
          )}

          {editing ? (
            <div style={{ display: "flex", gap: 8, justifyContent: "end", alignItems: "center", marginTop: 4 }}>
              <Button type="submit" className="btn ghost outline" disabled={!canSave || !!saving}>
                {activeLanguage.dictionary.save}
              </Button>
              <Button type="button" className="btn ghost" onClick={cancelEdit} disabled={!!saving}>
                {activeLanguage.dictionary.cancel}
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  backgroundColor: "var(--linkColor)",
                  borderRadius: "var(--borderRadiousRoundest)",
                  padding: 8,
                }}
              >
                <EditIcon className="link" style={{ color: "var(--secondary)" }} onClick={() => setEditing(true)} />
              </div>
            </div>
          )}
        </form>
      </div>

      <Snackbar
        open={okOpen}
        autoHideDuration={3000}
        onClose={() => setOkOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          {okMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errOpen}
        autoHideDuration={5000}
        onClose={() => setErrOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setErrOpen(false)} severity="error" variant="filled" sx={{ width: "100%" }}>
          {errMsg}
        </Alert>
      </Snackbar>

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <DialogTitle>{activeLanguage.dictionary.changeAvatar}</DialogTitle>
        <DialogContent>
          <div style={{ opacity: 0.7 }}>Preset picker placeholder</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPickerOpen(false)}>{activeLanguage.dictionary.close}</Button>
        </DialogActions>
      </Dialog>

      <HobbyEditor
        open={Boolean(editingHobby)}
        value={editingHobby}
        onClose={() => setEditingHobby(null)}
        onSave={(val) => {
          setHobbies((prev) => (!val.id ? [...prev, val] : prev.map((h) => (h.id === val.id ? val : h))));
          setEditingHobby(null);
        }}
        iconByKey={iconByKey}
      />
    </main>
  );
};

export default ProfileMobile;
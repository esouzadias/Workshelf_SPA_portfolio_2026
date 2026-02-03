import { useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Section } from "../../../../lib/Models";
import "./PersonalSectionMobile.less";

type TabKey = "about" | "languages" | "contacts" | "hobbies";

const LVL = ["A1", "A2", "B1", "B2", "C1", "C2", "beginner", "intermediate", "advanced", "fluent", "native_like"];
const CONTACT_TYPES = ["email", "phone", "website", "linkedin", "github", "twitter", "instagram", "other"];

interface PersonalSectionProps {
  activeLanguage: any;
  editing: any;
  maritalStatus: any;
  setMaritalStatus: any;
  profileEnums: any;
  dependents: any;
  setDependents: any;
  hobbies: any;
  setHobbies: any;
  setEditingHobby: any;
  iconByKey: any;
  languages?: any[];
}

const PersonalSectionMobile = ({
  activeLanguage,
  editing,
  maritalStatus,
  setMaritalStatus,
  profileEnums,
  dependents,
  setDependents,
  hobbies,
  setHobbies,
  setEditingHobby,
  iconByKey,
  languages,
}: PersonalSectionProps) => {
  const canEdit = typeof editing === "boolean" ? editing : true;
  const [tab, setTab] = useState<TabKey>("about");

  const [aboutVal, setAboutVal] = useState<string>(editing?.about ?? "");
  const setAbout = (v: string) => {
    if (editing?.setAbout) editing.setAbout(v);
    setAboutVal(v);
  };

  const [langs, setLangs] = useState<any[]>(Array.isArray(editing?.languages) ? editing.languages : []);
  useEffect(() => {
    if (Array.isArray(languages)) setLangs(languages);
  }, [languages]);

  const addLanguage = () => {
    const item = { name: "", level: "B2", isNative: false };
    if (editing?.addLanguage) editing.addLanguage(item);
    else setLangs((prev) => [...prev, item]);
  };

  const updateLanguage = (i: number, patch: any) => {
    if (editing?.setLanguage) editing.setLanguage(i, { ...(langs[i] ?? {}), ...patch });
    else setLangs((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const removeLanguage = (i: number) => {
    if (editing?.removeLanguage) editing.removeLanguage(i);
    else setLangs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const [contacts, setContacts] = useState<any[]>(Array.isArray(editing?.contacts) ? editing.contacts : []);

  const addContact = () => {
    const item = { type: "email", value: "", label: "" };
    if (editing?.addContact) editing.addContact(item);
    else setContacts((prev) => [...prev, item]);
  };

  const updateContact = (i: number, patch: any) => {
    if (editing?.setContact) editing.setContact(i, { ...(contacts[i] ?? {}), ...patch });
    else setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const removeContact = (i: number) => {
    if (editing?.removeContact) editing.removeContact(i);
    else setContacts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const tabs = useMemo(
    () => [
      { k: "about" as const, l: activeLanguage.dictionary.aboutMe ?? "About" },
      { k: "languages" as const, l: activeLanguage.dictionary.languages ?? "Languages" },
      { k: "contacts" as const, l: activeLanguage.dictionary.contacts ?? "Contacts" },
      { k: "hobbies" as const, l: activeLanguage.dictionary.hobbies ?? "Hobbies" },
    ],
    [activeLanguage]
  );

  return (
    <>
      <div className="psm-tabs">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            className={`psm-tab ${tab === t.k ? "is-active" : ""}`}
            onClick={() => setTab(t.k)}
          >
            {t.l}
          </button>
        ))}
      </div>

      <Section title="">
        {tab === "about" && (
          <div className="psm-stack">
            <select
              className="input"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value as any)}
              disabled={!canEdit || !profileEnums.maritalStatus?.length}
            >
              <option value="">—</option>
              {profileEnums.maritalStatus?.map((v: string) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <input
              className="input"
              type="number"
              min={0}
              value={dependents}
              onChange={(e) => setDependents(parseInt(e.target.value || "0", 10))}
              disabled={!canEdit}
            />

            <textarea
              className="input"
              rows={6}
              placeholder={activeLanguage.dictionary.aboutMePlaceholder ?? "Tell a short story about you."}
              disabled={!canEdit}
              value={aboutVal}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
        )}

        {tab === "languages" && (
          <div className="psm-stack">
            {langs.length === 0 && <div style={{ opacity: 0.7 }}>—</div>}

            {langs.map((l: any, i: number) => (
              <div key={i} className="psm-card">
                <input
                  className="input"
                  placeholder={activeLanguage.dictionary.language ?? "Language"}
                  value={l.name}
                  disabled={!canEdit}
                  onChange={(e) => updateLanguage(i, { name: e.target.value })}
                />

                <select
                  className="input"
                  value={l.level}
                  disabled={!canEdit}
                  onChange={(e) => updateLanguage(i, { level: e.target.value })}
                >
                  {LVL.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>

                <div className="psm-row">
                  <label className="psm-check">
                    <input
                      type="checkbox"
                      checked={!!l.isNative}
                      disabled={!canEdit}
                      onChange={(e) => updateLanguage(i, { isNative: e.target.checked })}
                    />
                    <span>{activeLanguage.dictionary.native ?? "Native"}</span>
                  </label>

                  {canEdit && (
                    <IconButton onClick={() => removeLanguage(i)} size="small" color="error" aria-label="remove">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </div>
              </div>
            ))}

            {canEdit && (
              <div className="psm-actions">
                <Button className="btn ghost" onClick={addLanguage}>
                  {activeLanguage.dictionary.addLanguage ?? "Add language"}
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "contacts" && (
          <div className="psm-stack">
            {contacts.length === 0 && <div style={{ opacity: 0.7 }}>—</div>}

            {contacts.map((c: any, i: number) => (
              <div key={i} className="psm-card">
                <select
                  className="input"
                  value={c.type}
                  disabled={!canEdit}
                  onChange={(e) => updateContact(i, { type: e.target.value })}
                >
                  {CONTACT_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  placeholder={activeLanguage.dictionary.value ?? "Value"}
                  value={c.value}
                  disabled={!canEdit}
                  onChange={(e) => updateContact(i, { value: e.target.value })}
                />

                <input
                  className="input"
                  placeholder={activeLanguage.dictionary.label ?? "Label (optional)"}
                  value={c.label ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => updateContact(i, { label: e.target.value })}
                />

                {canEdit && (
                  <div className="psm-actions">
                    <IconButton onClick={() => removeContact(i)} size="small" color="error" aria-label="remove">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}

            {canEdit && (
              <div className="psm-actions">
                <Button className="btn ghost" onClick={addContact}>
                  {activeLanguage.dictionary.addContact ?? "Add contact"}
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "hobbies" && (
          <div className="psm-stack">
            {canEdit && (
              <div className="psm-actions">
                <Button className="btn ghost" onClick={() => setEditingHobby({ name: "", description: "", icon: "idea" })}>
                  {activeLanguage.dictionary.addHobby}
                </Button>
              </div>
            )}

            {hobbies.length === 0 ? (
              <div style={{ opacity: 0.7 }}>—</div>
            ) : (
              hobbies.map((h: any, i: number) => (
                <div key={(h.id ?? "") + i} className="psm-hobby">
                  <div className="psm-hobbyIcon">{iconByKey(h.icon)}</div>

                  <div className="psm-hobbyBody">
                    <div className="psm-hobbyName">{h.name}</div>
                    {h.description ? <div className="psm-hobbyDesc">{h.description}</div> : null}
                  </div>

                  {canEdit && (
                    <div className="psm-hobbyActions">
                      <Button
                        variant="text"
                        style={{ color: "var(--linkColor)", fontWeight: 800 }}
                        onClick={() => setEditingHobby(h)}
                      >
                        {activeLanguage.dictionary.edit}
                      </Button>
                      <IconButton
                        onClick={() => setHobbies((prev: any) => prev.filter((x: any) => x !== h))}
                        size="small"
                        color="error"
                        aria-label="remove"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Section>
    </>
  );
};

export default PersonalSectionMobile;
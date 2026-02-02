import { useState, useEffect } from "react";
import { Section } from "../../../lib/Models";
import { Button } from "@mui/material";
import { IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

const LVL = ["A1", "A2", "B1", "B2", "C1", "C2", "beginner", "intermediate", "advanced", "fluent", "native_like"];
const CONTACT_TYPES = ["email", "phone", "website", "linkedin", "github", "twitter", "instagram", "other"];

const PersonalSection = ({
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
    languages
}: PersonalSectionProps) => {
    const canEdit = typeof editing === "boolean" ? editing : true;
    const [tab, setTab] = useState<"about" | "languages" | "contacts" | "hobbies">("about");

    const [aboutVal, setAboutVal] = useState<string>(editing?.about ?? "");
    const setAbout = (v: string) => {
        if (editing?.setAbout) editing.setAbout(v);
        setAboutVal(v);
    };

    const [langs, setLangs] = useState<any[]>(Array.isArray(editing?.languages) ? editing.languages : []);
    const addLanguage = () => {
        const item = { name: "", level: "B2", isNative: false };
        if (editing?.addLanguage) editing.addLanguage(item);
        else setLangs(prev => [...prev, item]);
    };
    const updateLanguage = (i: number, patch: any) => {
        if (editing?.setLanguage) editing.setLanguage(i, { ...(langs[i] ?? {}), ...patch });
        else setLangs(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
    };
    const removeLanguage = (i: number) => {
        if (editing?.removeLanguage) editing.removeLanguage(i);
        else setLangs(prev => prev.filter((_, idx) => idx !== i));
    };
    useEffect(() => {
        if (Array.isArray(languages)) setLangs(languages);
    }, [languages]);

    const [contacts, setContacts] = useState<any[]>(Array.isArray(editing?.contacts) ? editing.contacts : []);
    const addContact = () => {
        const item = { type: "email", value: "", label: "" };
        if (editing?.addContact) editing.addContact(item);
        else setContacts(prev => [...prev, item]);
    };
    const updateContact = (i: number, patch: any) => {
        if (editing?.setContact) editing.setContact(i, { ...(contacts[i] ?? {}), ...patch });
        else setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));
    };
    const removeContact = (i: number) => {
        if (editing?.removeContact) editing.removeContact(i);
        else setContacts(prev => prev.filter((_, idx) => idx !== i));
    };

    return (
        <>
            {/* Tabs OUTSIDE the grid to center correctly */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                {[
                    { k: "about", l: activeLanguage.dictionary.aboutMe ?? "Sobre mim" },
                    { k: "languages", l: activeLanguage.dictionary.languages ?? "Línguas" },
                    { k: "contacts", l: activeLanguage.dictionary.contacts ?? "Contactos" },
                    { k: "hobbies", l: activeLanguage.dictionary.hobbies ?? "Hobbies" },
                ].map((t: any) => (
                    <button
                        key={t.k}
                        onClick={() => setTab(t.k)}
                        disabled={tab === t.k}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(148,163,184,.25)",
                            background: tab === t.k ? "rgba(148,163,184,.18)" : "transparent",
                            color: "inherit",
                            cursor: tab === t.k ? "default" : "pointer",
                        }}
                    >
                        {t.l}
                    </button>
                ))}
            </div>

            <Section title="">
                {tab === "about" && (
                    <div style={{ gridColumn: "1 / -1", display: "grid", gap: 16, width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", }}>
                            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px" }}>
                                <h3 style={{ fontWeight: 500, marginBottom: 6 }}>{activeLanguage.dictionary.maritalStatus}</h3>
                                <select
                                    className="input"
                                    value={maritalStatus}
                                    onChange={e => setMaritalStatus(e.target.value as any)}
                                    disabled={!canEdit || !profileEnums.maritalStatus?.length}
                                >
                                    <option value="">—</option>
                                    {profileEnums.maritalStatus?.map((v: string) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "10px" }}>
                                <h3 style={{ fontWeight: 500, marginBottom: 6 }}>{activeLanguage.dictionary.dependents}</h3>
                                <input
                                    className="input"
                                    type="number"
                                    min={0}
                                    value={dependents}
                                    onChange={e => setDependents(parseInt(e.target.value || "0", 10))}
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ fontWeight: 500, marginBottom: 6 }}>
                                {activeLanguage.dictionary.aboutMeIntro ?? activeLanguage.dictionary.aboutMe ?? "Sobre mim"}
                            </div>
                            <textarea
                                className="input"
                                rows={6}
                                placeholder={activeLanguage.dictionary.aboutMePlaceholder ?? "Tell a short story about you, focus on impact."}
                                disabled={!canEdit}
                                value={aboutVal}
                                onChange={e => setAbout(e.target.value)}
                                style={{ resize: "vertical" }}
                            />
                        </div>
                    </div>
                )}

                {tab === "languages" && (
                    <div style={{ gridColumn: "1 / -1", display: "grid", gap: 16, width: "100%"}}>
                        {langs.length === 0 && <div style={{ opacity: 0.7 }}>—</div>}
                        {langs.map((l: any, i: number) => (
                            <div
                                key={i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 160px auto",
                                    gap: 12,
                                    alignItems: "center",
                                    padding: 12,
                                    borderRadius: 12,
                                    border: "1px solid rgba(148,163,184,.25)",
                                    background: "rgba(148,163,184,.08)",
                                }}
                            >
                                <input
                                    className="input"
                                    placeholder={activeLanguage.dictionary.language ?? "Língua"}
                                    value={l.name}
                                    disabled={!canEdit}
                                    onChange={e => updateLanguage(i, { name: e.target.value })}
                                />
                                <select
                                    className="input"
                                    value={l.level}
                                    disabled={!canEdit}
                                    onChange={e => updateLanguage(i, { level: e.target.value })}
                                >
                                    {LVL.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={!!l.isNative}
                                            disabled={!canEdit}
                                            onChange={e => updateLanguage(i, { isNative: e.target.checked })}
                                            style={{
                                                appearance: "none",
                                                width: 18,
                                                height: 18,
                                                borderRadius: 4,
                                                border: "1px solid rgba(148,163,184,.5)",
                                                background: l.isNative ? "var(--linkColor)" : "transparent",
                                                transition: "background .2s ease",
                                            }}
                                        />
                                        <span style={{ fontSize: 13 }}>{activeLanguage.dictionary.native ?? "Nativa"}</span>
                                    </label>

                                    <div
                                        style={{
                                            position: "relative",
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: `conic-gradient(var(--linkColor) ${Math.min(100, (LVL.indexOf(l.level) + 1) * (100 / LVL.length))
                                                }%, rgba(148,163,184,.15) 0%)`,
                                            display: "grid",
                                            placeItems: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                width: 20,
                                                height: 20,
                                                borderRadius: "50%",
                                                background: "var(--third)",
                                            }}
                                        />
                                    </div>

                                    {canEdit && (
                                        <IconButton onClick={() => removeLanguage(i)} size="small" color="error" aria-label="remove">
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </div>
                            </div>
                        ))}
                        {canEdit && (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button className="btn ghost" onClick={addLanguage}>
                                    {activeLanguage.dictionary.addLanguage ?? "Adicionar língua"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {tab === "contacts" && (
                    <div style={{ display: "grid", gap: 20 }}>
                        {contacts.length === 0 && <div style={{ opacity: 0.7 }}>—</div>}
                        {contacts.map((c: any, i: number) => (
                            <div
                                key={i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "150px 1fr 180px auto",
                                    gap: 12,
                                    alignItems: "center",
                                    padding: 12,
                                    borderRadius: 12,
                                    border: "1px solid rgba(148,163,184,.25)",
                                    background: "linear-gradient(180deg, rgba(148,163,184,.08), rgba(148,163,184,.05))",
                                }}
                            >
                                <select
                                    className="input"
                                    value={c.type}
                                    disabled={!canEdit}
                                    onChange={e => updateContact(i, { type: e.target.value })}
                                >
                                    {CONTACT_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <input
                                    className="input"
                                    placeholder={activeLanguage.dictionary.value ?? "Valor (ex: user@host.com / URL)"}
                                    value={c.value}
                                    disabled={!canEdit}
                                    onChange={e => updateContact(i, { value: e.target.value })}
                                />
                                <input
                                    className="input"
                                    placeholder={activeLanguage.dictionary.label ?? "Etiqueta (opcional)"}
                                    value={c.label ?? ""}
                                    disabled={!canEdit}
                                    onChange={e => updateContact(i, { label: e.target.value })}
                                />
                                {canEdit && (
                                    <IconButton onClick={() => removeContact(i)} size="small" color="error" aria-label="remove">
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </div>
                        ))}
                        {canEdit && (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button className="btn ghost" onClick={addContact}>
                                    {activeLanguage.dictionary.addContact ?? "Adicionar contacto"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {tab === "hobbies" && (
                    <>
                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                            {canEdit && (
                                <Button className="btn ghost" onClick={() => setEditingHobby({ name: "", description: "", icon: "idea" })}>
                                    {activeLanguage.dictionary.addHobby}
                                </Button>
                            )}
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "grid", gap: 16 }}>
                            {hobbies.length === 0 ? (
                                <div style={{ opacity: 0.7 }}>—</div>
                            ) : (
                                hobbies.map((h: any, i: any) => (
                                    <div
                                        key={(h.id ?? "") + i}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "28px 1fr auto",
                                            gap: 10,
                                            alignItems: "center",
                                            padding: 10,
                                            border: "1px solid rgba(148,163,184,.25)",
                                            borderRadius: 12,
                                            background: "rgba(148,163,184,.08)",
                                        }}
                                    >
                                        <div style={{ display: "grid", placeItems: "center" }}>{iconByKey(h.icon)}</div>
                                        <div style={{ lineHeight: 1.2 }}>
                                            <div style={{ fontWeight: 700 }}>{h.name}</div>
                                            {h.description && <div style={{ opacity: 0.8, marginTop: 4 }}>{h.description}</div>}
                                        </div>
                                        {canEdit && (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <Button variant="text" style={{ color: "var(--linkColor)", fontWeight: "bold" }} onClick={() => setEditingHobby(h)}>
                                                    {activeLanguage.dictionary.edit}
                                                </Button>
                                                <IconButton onClick={() => setHobbies((prev: any) => prev.filter((x: any) => x !== h))} size="small" color="error" aria-label="remove">
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </Section>
        </>
    );
};

export default PersonalSection;
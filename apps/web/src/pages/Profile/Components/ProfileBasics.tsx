import React, { useMemo } from 'react';
import { Section } from '../../../lib/Models';
import { Button } from "@mui/material";
import type { UserProfile } from '../types';

type User = { id: string; email: string; profile?: UserProfile | null };

interface ProfileBasicsProps {
    activeLanguage: any;
    editing: any;
    setEditing: any;
    user: any;
    resizeImageToDataUrl: any;
    setOkMsg: any;
    setOkOpen: any;
    setErrMsg: any;
    setErrOpen: any;
    hadAvatar: any;
    setAvatarDataUrl: any;
    avatarPreview: any;
    setAvatarPreview: any;
    avatarRemoved: any;
    setAvatarRemoved: any;
    displayName: any;
    setDisplayName: any;
    fullName: any;
    setFullName: any;
    birthDate: any;
    setBirthDate: any;
    gender: any;
    setGender: any;
    nationality: any;
    setNationality: any;
    profileEnums: any;
}

const ProfileBasics = ({
    activeLanguage,
    editing,
    user,
    resizeImageToDataUrl,
    setOkMsg,
    setOkOpen,
    setErrMsg,
    setErrOpen,
    hadAvatar,
    avatarPreview,
    setAvatarPreview,
    avatarRemoved,
    setAvatarRemoved,
    setAvatarDataUrl,
    displayName,
    setDisplayName,
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    gender,
    setGender,
    nationality,
    setNationality,
    profileEnums,


}: ProfileBasicsProps) => {
    const shownAvatar = useMemo(() => {
        if (avatarPreview) return avatarPreview;
        if (avatarRemoved) {
            const seed = (user?.profile?.displayName || user?.email || "user") as string;
            return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed)}`;
        }
        const p = (user as User | null)?.profile;
        const seed = p?.displayName || (user as User | null)?.email || "user";
        return p?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed)}`;
    }, [avatarPreview, avatarRemoved, user]);

    const onPickAvatar: React.ChangeEventHandler<HTMLInputElement> = async e => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        setAvatarPreview(URL.createObjectURL(f));
        setAvatarRemoved(false);
        try {
            const dataUrl = await resizeImageToDataUrl(f, 256, 0.8);
            setAvatarDataUrl(dataUrl);
            setOkMsg(activeLanguage.dictionary.pictureSelected ?? "Picture selected");
            setOkOpen(true);
        } catch {
            setErrMsg(activeLanguage.dictionary.unknownError ?? "Error reading file");
            setErrOpen(true);
        }
    };

    const onRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarDataUrl(null);
        setAvatarRemoved(true);
        setOkMsg((activeLanguage.dictionary.profilePicture || "Profile picture") + " - reset");
        setOkOpen(true);
    };

    return (
        <>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* <h2>{activeLanguage.dictionary.profile}</h2> */}
                {/* <EditIcon className="link" style={{ color: "var(--linkColor)" }} onClick={setEditing(true)} /> */}
            </span>

            <Section title="">
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, alignItems: "center"}}>
                    <img
                        src={shownAvatar}
                        alt="avatar"
                        style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb" }}
                    />
                    {editing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <label className="btn ghost" style={{ cursor: "pointer" }}>
                                {activeLanguage.dictionary.changePicture}
                                <input type="file" accept="image/*" onChange={onPickAvatar} style={{ display: "none" }} />
                            </label>
                            {(hadAvatar || avatarPreview || avatarRemoved) && (
                                <Button className="btn ghost outline" variant="text" onClick={onRemoveAvatar}>
                                    {activeLanguage.dictionary.remove ?? "Remove"}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <span style={{ opacity: 0.7 }}>{/* {activeLanguage.dictionary.profilePicture} */}</span>
                    )}
                </div>

                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.displayName}</div>
                    <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={!editing} />
                </div>

                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.fullName}</div>
                    <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} disabled={!editing} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.birthDate}</div>
                    <input className="input" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} disabled={!editing} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.gender}</div>
                    <select className="input" value={gender} onChange={e => setGender(e.target.value as any)} disabled={!editing || !profileEnums.gender?.length}>
                        {profileEnums.gender?.map((g: string) => (
                            <option key={g} value={g}>
                                {(activeLanguage.dictionary as unknown as Record<string, string>)[g] ?? g}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.nationality}</div>
                    <input className="input" value={nationality} onChange={e => setNationality(e.target.value)} disabled={!editing} />
                </div>
            </Section>
        </>
    )
}

export default ProfileBasics
import React, {useEffect, useState} from 'react'
import { useLanguage } from "../../../lib/locale.context";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
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

type Hobby = { id?: string; name: string; description?: string | null; icon?: string | null };

const HobbyEditor: React.FC<{ 
    open: boolean;
    iconByKey:any;
    value: Hobby | null; 
    onClose: () => void; 
    onSave: (h: Hobby) => void }> = ({ 
        open, 
        value, 
        onClose,
        onSave,
        iconByKey,
    }) => {
    const { activeLanguage } = useLanguage();
    const [name, setName] = useState(value?.name ?? "");
    const [description, setDescription] = useState(value?.description ?? "");
    const [icon, setIcon] = useState(value?.icon ?? "idea");
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        setName(value?.name ?? "");
        setDescription(value?.description ?? "");
        setIcon(value?.icon ?? "idea");
    }, [value, open]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ ...value, name: name.trim(), description: description?.trim() || "", icon: icon || "idea" } as Hobby);
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

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle style={{ fontSize: 26, color: "var(--primary)", fontWeight: 600 }}>
                {value?.id ? activeLanguage.dictionary.editHobby : activeLanguage.dictionary.addHobby}
            </DialogTitle>
            <DialogContent>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.name}</h3>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <h3>{activeLanguage.dictionary.icon}:</h3>
                                <Button className="btn ghost" style={{ color: "var(--primary)" }} variant="outlined" onClick={() => setPickerOpen(true)} startIcon={iconByKey(icon)}>
                                    <strong>{ICON_CATALOG.find(i => i.key === icon)?.label ?? "Pick icon"}</strong>
                                </Button>
                            </div>
                        </div>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.description}</h3>
                        <textarea className="input" style={{ minWidth: 400 }} minLength={200} maxLength={600} value={description} onChange={e => setDescription(e.target.value)} rows={10} />
                    </div>
                </div>

                <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)}>
                    <DialogTitle>
                        <strong>{activeLanguage.dictionary.pickIcon}</strong>
                    </DialogTitle>
                    <DialogContent>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                            {ICON_CATALOG.map(ic => (
                                <Button
                                    className="btn ghost outline"
                                    key={ic.key}
                                    variant={icon === ic.key ? "contained" : "outlined"}
                                    onClick={() => {
                                        setIcon(ic.key);
                                        setPickerOpen(false);
                                    }}
                                    startIcon={ic.el}
                                    style={{ textTransform: "none" }}
                                >
                                    {ic.label}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button className="btn ghost" onClick={() => setPickerOpen(false)}>
                            {activeLanguage.dictionary.close}
                        </Button>
                    </DialogActions>
                </Dialog>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {activeLanguage.dictionary.cancel}
                </Button>
                <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
                    {activeLanguage.dictionary.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HobbyEditor
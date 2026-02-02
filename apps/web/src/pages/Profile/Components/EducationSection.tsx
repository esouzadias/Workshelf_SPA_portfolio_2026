import { Section } from '../../../lib/Models';

interface EducationSectionProps{
    activeLanguage: any;
    editing: any;
    education: any;
    setEducation: any
    school:any;
    setSchool:any;
    degree:any;
    setDegree:any;
    schoolLogoUrl: any;
    setSchoolLogoUrl: any;
    resizeImageToDataUrl: any;
    
}

const EducationSection = ({
    activeLanguage, 
    editing,
    education,
    setEducation,
    school,
    setSchool,
    degree,
    setDegree,
    schoolLogoUrl,
    setSchoolLogoUrl,
    resizeImageToDataUrl

    
}: EducationSectionProps) => {
    return (
        <>
            {/* <h2>{(activeLanguage.dictionary.education)?.toLowerCase()}</h2> */}
            <Section title="">
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.schoolLevel}</div>
                    <select className="input" value={education} onChange={e => setEducation(e.target.value)} disabled={!editing}>
                        <option value="Doctorate">{activeLanguage.dictionary.doctorate}</option>
                        <option value="Masters">{activeLanguage.dictionary.masters}</option>
                        <option value="College">{activeLanguage.dictionary.college}</option>
                        <option value="HighSchool">{activeLanguage.dictionary.highSchool}</option>
                        <option value="Basic">{activeLanguage.dictionary.basic}</option>
                    </select>
                    {/* <input className="input" value={education} onChange={e => setEducation(e.target.value)} disabled={!editing} /> */}
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.school}</div>
                    <input className="input" value={school} onChange={e => setSchool(e.target.value)} disabled={!editing} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.degree}</div>
                    <input className="input" value={degree} onChange={e => setDegree(e.target.value)} disabled={!editing} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.schoolLogo}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <img
                            src={schoolLogoUrl || "data:image/gif;base64,R0lGODlhAQABAAAAACw="}
                            alt=""
                            style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", border: "1px solid #e5e7eb", background: "#f3f4f6" }}
                        />
                        {editing && (
                            <label className="btn ghost" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                                {activeLanguage.dictionary.upload}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async e => {
                                        const f = e.target.files?.[0] ?? null;
                                        if (!f) return;
                                        const dataUrl = await resizeImageToDataUrl(f, 160, 0.8);
                                        setSchoolLogoUrl(dataUrl);
                                    }}
                                    style={{ display: "none" }}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </Section>
        </>
    )
}

export default EducationSection
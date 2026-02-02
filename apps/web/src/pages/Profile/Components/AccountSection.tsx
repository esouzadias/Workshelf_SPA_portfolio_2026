import { Section } from '../../../lib/Models';
import type { LocaleCode, ThemeChoice } from '../types';


interface AccountSectionProps {
    activeLanguage: any;
    editing: any;
    email: any;
    setEmail: any;
    currentPwd: any;
    setCurrentPwd: any;
    newPwd: any;
    setNewPwd: any;
    locale:any;
    setLocale:any;
    theme: any;
    setTheme: any;
}

const AccountSection = ({
    activeLanguage,
    editing,
    email,
    setEmail,
    currentPwd,
    setCurrentPwd,
    newPwd,
    setNewPwd,
    locale,
    setLocale,
    theme,
    setTheme,

}: AccountSectionProps) => {
    return (
        <>
            {/* <h2>{activeLanguage.dictionary.account}</h2> */}
            <Section title="">
                <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ fontWeight: 600 }}>{activeLanguage.dictionary.email}</div>
                        {!editing && (
                            <span style={{ opacity: 0.5, fontSize: "10px" }}>{`(${activeLanguage.dictionary.infos["emailChangeNote"] ?? "(Email editing will require your current password.)"})`}</span>
                        )}
                    </div>
                    <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!editing} />

                </div>

                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.password}</div>
                    <input className="input" type="password" placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} disabled={!editing} />
                </div>

                {editing && (
                    <>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                {activeLanguage.dictionary.newPassword} <span style={{ opacity: 0.6 }}>({activeLanguage.dictionary.optional ?? "optional"})</span>
                            </div>
                            <input className="input" type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                        </div>
                    </>
                )}

                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.language}</div>
                    <select className="input" value={locale} onChange={e => setLocale(e.target.value as LocaleCode)} disabled={!editing}>
                        <option value="en">{activeLanguage.dictionary.en}</option>
                        <option value="pt">{activeLanguage.dictionary.pt}</option>
                    </select>
                </div>
                
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{activeLanguage.dictionary.preferedTheme}</div>
                    <select className="input" value={theme} onChange={e => setTheme(e.target.value as ThemeChoice)} disabled={!editing}>
                        <option value="system">{activeLanguage.dictionary.system}</option>
                        <option value="light">{activeLanguage.dictionary.light}</option>
                        <option value="dark">{activeLanguage.dictionary.dark}</option>
                    </select>
                </div>
            </Section>
        </>
    )
}

export default AccountSection
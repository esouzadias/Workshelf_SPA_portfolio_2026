export type ThemeChoice = "system" | "light" | "dark";
export type LocaleCode = "en" | "pt";

export type Hobby = { id?: string; name: string; description?: string | null; icon?: string | null };

export type WorkClient = { name: string; logo: string | null };
export type WorkBlock = {
    companyName: string;
    companyLogo: string | null;
    title: string;
    start: string;    // ISO yyyy-mm-dd
    end: string;      // "" quando isCurrent = true
    isCurrent: boolean;
    isConsultancy: boolean;
    clients: WorkClient[];
};

export type UserProfile = {
    displayName?: string | null;
    theme?: ThemeChoice | null;
    locale?: LocaleCode | null;
    avatarUrl?: string | null;
    fullName?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    nationality?: string | null;

    employmentStatus?: string | null;

    // legacy flat (manténs por compat):
    currentTitle?: string | null;
    currentCompany?: string | null;
    currentClient?: string | null;
    currentRoleStart?: string | null;
    currentCompanyLogoUrl?: string | null;
    currentClientLogoUrl?: string | null;

    education?: string | null;
    school?: string | null;
    schoolLogoUrl?: string | null;
    Degree?: string | null;

    maritalStatus?: string | null;
    dependents?: number | null;
    hobbies?: Hobby[];
};
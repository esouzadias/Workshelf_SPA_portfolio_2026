import React from "react";
import { apiPut } from "./api";
import { useAuth } from "./auth.context";
import { DICTS, type Locale, type Dict } from "../i18n/messages";

const LOCALE_KEY = "ws_locale_override";

// Keys of Dict whose value is (string | undefined) or string
type StringKeyOf<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined> extends string ? K : never;
}[keyof T];

type FlatKeys = StringKeyOf<Dict>;

type ActiveLanguage = {
  code: Locale;
  dictionary: Dict;
};

type Ctx = {
  locale: Locale;
  activeLanguage: ActiveLanguage;
  setLocale: (l: Locale, opts?: { persistOnlyLocal?: boolean }) => Promise<void>;
  t: (key: FlatKeys) => string;
};

const LocaleCtx = React.createContext<Ctx | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const initial = (localStorage.getItem(LOCALE_KEY) as Locale) || "en";
  const [locale, _setLocale] = React.useState<Locale>(initial);

  React.useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  async function setLocale(l: Locale, opts?: { persistOnlyLocal?: boolean }) {
    _setLocale(l);
    localStorage.setItem(LOCALE_KEY, l);

    if (user && !opts?.persistOnlyLocal) {
      try {
        await apiPut("/users/profile", { locale: l }, { softAuth: true });
      } catch {}
    }
  }

  const dictionary = DICTS[locale];
  const t = (key: FlatKeys) => dictionary[key] ?? String(key);

  const activeLanguage: ActiveLanguage = { code: locale, dictionary };

  return (
    <LocaleCtx.Provider value={{ locale, activeLanguage, setLocale, t }}>
      {children}
    </LocaleCtx.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale precisa do LocaleProvider");
  return ctx;
}

export const useLanguage = useLocale;
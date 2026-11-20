import React, { createContext, useContext, useEffect } from "react";
import ja from "./ja";

// Add a catalog here to support another locale without changing UI components.
export const catalogs = { ja };
export const supportedLocales = Object.keys(catalogs);
const I18nContext = createContext({ locale: "ja", copy: ja });
export function I18nProvider({ locale = "ja", children }) {
  const resolved = catalogs[locale] ? locale : "ja";
  const copy = catalogs[resolved];
  useEffect(() => {
    document.documentElement.lang = resolved;
    document.title = copy.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.meta.description);
  }, [resolved, copy]);
  return (
    <I18nContext.Provider value={{ locale: resolved, copy }}>
      {children}
    </I18nContext.Provider>
  );
}
export const useI18n = () => useContext(I18nContext);

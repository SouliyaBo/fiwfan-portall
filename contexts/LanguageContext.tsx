"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import th from '../locales/th.json';
import lo from '../locales/lo.json';
import zh from '../locales/zh.json';
import en from '../locales/en.json';

type Locale = 'th' | 'lo' | 'zh' | 'en';
type Translations = typeof th;

const languages: Record<Locale, Translations> = { th, lo, zh, en };

interface LanguageContextProps {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Locale>('th');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Locale;
        if (saved && languages[saved]) {
            setLanguage(saved);
            document.documentElement.lang = saved;
        } else {
            document.documentElement.lang = 'th';
        }
    }, []);

    const changeLanguage = (lang: Locale) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = languages[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
};

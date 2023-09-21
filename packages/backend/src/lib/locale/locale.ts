import { Request } from "express";
import de from "./de";
import en, { ValidKeys } from "./en";

const fallbackLanguage = 'en'

const languages: { [lang: string]: { [key in ValidKeys]?: string } } = {
    en,
    de,
}

function formatString(term: string, args: any[]): string {
    return args.reduce((text, item, index) => {
        return text.replaceAll(`{${index}}`, item);
    }, term);
}

export function $t(req: Request, key: ValidKeys, ...args: any[]): string {
    let language = req.acceptsLanguages(Object.keys(languages))
    if (!language) {
        language = fallbackLanguage;
    }

    if (language in languages) {
        const term = languages[language as keyof typeof languages][key];
        if (term) {
            // If term was not found, try the fallback language
            return formatString(term, args);
        } else {
            console.warn('missing key for language', language, key);
        }
    }

    const term = languages['en'][key];
    if (!term) {
        console.warn('missing key', key);
    }
    return formatString(term ?? key, args);
}
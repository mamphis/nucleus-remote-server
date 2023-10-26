import de from "./de";
import en, { type ValidKeys } from "./en";
import it from "./it";
import fr from "./fr";

const fallbackLanguage = 'en';

const languages: { [lang: string]: { [key in ValidKeys | string]?: string } } = {
    en,
    de,
    it,
    fr,
}

function formatString(term: string, args: any[]): string {
    return args.reduce((text, item, index) => {
        return text.replaceAll(`{${index}}`, item);
    }, term);
}

export function $t(key: ValidKeys | string, ...args: any[]): string {
    const language = navigator.language.split('-')[0] ?? fallbackLanguage;

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
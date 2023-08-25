import de from "./de";
import en from "./en";
import it from "./it";
import fr from "./fr";

const fallbackLanguage = 'en';

const languages = {
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

export function $t(key: string, ...args: any[]): string {
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
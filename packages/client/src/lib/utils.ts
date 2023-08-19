const formatter = Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'medium' });

export function formatDate(date: Date | string | number): string {
    if (typeof date === 'string') {
        return formatter.format(new Date(date));
    }

    return formatter.format(date)
}
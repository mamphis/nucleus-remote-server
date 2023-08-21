const formatter = Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'medium' });
const humanizer = new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto', style: 'short' });

const getDate = (date: Date | string | number): Date => {
    return new Date(date)
}

export function formatDate(date: Date | string | number): string {
    return formatter.format(getDate(date))
}

export function humanizeDate(date: Date | string | number): string {
    const oneHour = 1000 * 60 * 60;
    const msBetweenDates = new Date().getTime() - getDate(date).getTime();
    if (msBetweenDates < oneHour * 24) {
        return humanizer.format(-msBetweenDates / oneHour, 'hour');
    }
    return humanizer.format(-msBetweenDates / (oneHour * 24), 'day');
}
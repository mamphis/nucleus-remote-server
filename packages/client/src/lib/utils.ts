const formatter = Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'medium' });
const humanizer = new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto', style: 'short' });

const getDate = (date: Date | string | number): Date => {
    return new Date(date)
}

export function formatDate(date: Date | string | number): string {
    return formatter.format(getDate(date))
}

export function humanizeDate(date: Date | string | number): string {
    const
        WEEK_IN_MILLIS = 6.048e8,
        DAY_IN_MILLIS = 8.64e7,
        HOUR_IN_MILLIS = 3.6e6,
        MIN_IN_MILLIS = 6e4,
        SEC_IN_MILLIS = 1e3;

    // For testing only, remove the constructor argument in production.
    const getCurrentUTCTime = () => new Date().getTime();

    const timeFromNow = () => {
        const
            millis = new Date(date).getTime(),
            diff = millis - getCurrentUTCTime();
        if (Math.abs(diff) > WEEK_IN_MILLIS)
            return humanizer.format(Math.trunc(diff / WEEK_IN_MILLIS), 'week');
        else if (Math.abs(diff) > DAY_IN_MILLIS)
            return humanizer.format(Math.trunc(diff / DAY_IN_MILLIS), 'day');
        else if (Math.abs(diff) > HOUR_IN_MILLIS)
            return humanizer.format(Math.trunc((diff % DAY_IN_MILLIS) / HOUR_IN_MILLIS), 'hour');
        else if (Math.abs(diff) > MIN_IN_MILLIS)
            return humanizer.format(Math.trunc((diff % HOUR_IN_MILLIS) / MIN_IN_MILLIS), 'minute');
        else
            return humanizer.format(Math.trunc((diff % MIN_IN_MILLIS) / SEC_IN_MILLIS), 'second');
    };

    return timeFromNow();
}

export function humanizeFileSize(bytes?: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = 0;
    if (!bytes) {
        return '0 B';
    }

    while (bytes >= 1024) {
        bytes /= 1024;
        ++i;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
}
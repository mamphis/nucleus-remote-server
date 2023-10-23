// Create a function that takes a function and returns a debounced version of that same function that will delay its execution until after wait milliseconds have elapsed since the last time it was invoked.

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: number | undefined;

    return function (this: any, ...args: any[]) {
        const context = this;

        const later = function () {
            timeout = undefined;
            func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait) as any;
    } as any;
}
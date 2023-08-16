import { isProduction, randomString } from "./util";

const levels = {
    verbose: '[v]',
    debug: '[d]',
    info: '[i]',
    warn: '[w]',
    error: '[e]',
    fatal: '[f]',
} as const;


export class Logger {
    private static format = Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'medium' }).format;

    private static log(level: (typeof levels)[keyof typeof levels], channel: (...args: any[]) => void, ...args: any[]) {
        const message = `${this.format(new Date())} ${level}:`;
        if (isProduction()) {
            if (([levels.verbose, levels.debug] as string[]).includes(level)) {
                return;
            }
        }

        channel(message, ...args);
    }

    static verbose = this.log.bind(this, '[v]', console.log);
    static debug = this.log.bind(this, '[d]', console.log);
    static info = this.log.bind(this, '[i]', console.log);
    static warn = this.log.bind(this, '[w]', console.warn);
    static error = this.log.bind(this, '[e]', console.error);
    static fatal = this.log.bind(this, '[f]', console.error);

    static enter() {
        return (target: object, memberName: string | symbol, propertyDescriptor: PropertyDescriptor) => {
            return {
                get() {
                    let wrapperFn = (...args: any[]) => {
                        const start = new Date();
                        let res =  propertyDescriptor.value?.apply(this, args);
                        let isPromise = res instanceof Promise;
                        if (isPromise) {
                            // res = await res;

                            res.then((ret: any) => {
                                Logger.verbose(`${target.constructor.name}.${memberName.toString()}(${args.join()}) => ${ret}: ${new Date().getTime() - start.getTime()}ms`);
                                return ret;
                            })
                        } else {
                            Logger.verbose(`${target.constructor.name}.${memberName.toString()}(${args.join()}) => ${res}: ${new Date().getTime() - start.getTime()}ms`);
                        }

                        return res;
                    }

                    Object.defineProperty(this, memberName, {
                        value: wrapperFn,
                        configurable: true,
                        writable: true
                    });

                    return wrapperFn;
                }
            }
        }
    }


}
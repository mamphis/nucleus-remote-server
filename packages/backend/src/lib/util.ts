import { randomBytes } from "crypto";
import { Logger } from "./logger";

class Utils {
    @Logger.enter()
    randomString(length: number) {
        const alphabet =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "1234567890" +
            "!#+.-_";

        return [...randomBytes(length)].map(n => alphabet.at(n % alphabet.length)).join('');
    }

    isProduction() {
        return process.env.NODE_ENV === 'production';
    }
}

const util = new Utils();

export const isProduction = util.isProduction.bind(util);
export const randomString = util.randomString.bind(util);
import { generateKeyPair, randomBytes } from "crypto";

class Utils {
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

type KeyPair = {
    publicKey: string;
    privateKey: string;
}

export const getKeyPair = async () => {
    return new Promise<KeyPair>((res, rej) => generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    }, (err, publicKey, privateKey) => {
        if (err) return rej(err);
        res({ publicKey, privateKey });
    }));
}

const util = new Utils();

export const isProduction = util.isProduction.bind(util);
export const randomString = util.randomString.bind(util);
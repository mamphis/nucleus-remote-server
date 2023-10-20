import { generateKeyPair, randomBytes } from "crypto";
import { Request } from "express";

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


export const generateConfigurationFile = (req: Request, clientId: string, tenantId: string, keyId: string, privateKey: string): string => {
    return JSON.stringify({
        "Logging": {
            "LogLevel": {
                "Default": "Information",
                "Microsoft.Hosting.Lifetime": "Information"
            }
        },
        "HostSettings": {
            "BaseUrl": `${req.header('x-forwarded-proto') ?? req.protocol}://${req.get('host')}/api/v1/`,
            "Id": clientId,
            "TenantId": tenantId,
            "KeyId": keyId,
            "PrivateKey": privateKey,
        }
    }, undefined, 4);
}

export const getIpFromRequest = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (!forwarded) {
        return req.socket.remoteAddress ?? 'unknown';
    }

    if (typeof forwarded === 'string') {
        return forwarded.split(/\s*,\s*/)[0];
    }

    return forwarded[0];
}

const util = new Utils();

export const isProduction = util.isProduction.bind(util);
export const randomString = util.randomString.bind(util);
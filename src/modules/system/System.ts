import crypto from 'crypto';

const SECRET_KEY: string = process.env.SECRECT_KEY || '0f669caff6ae2d8e245caf9d0d68857b13411530a6f712c8d84320fc3a718005';

import * as jwt from 'jsonwebtoken';


export function encryptObject(payload: any): string | null {
    try {
        if (SECRET_KEY) {
            return jwt.sign(payload, SECRET_KEY);
        }
        return null;
    } catch (e) {
        return null;
    }

}

export function decryptObject(token: string): any {
    try {
        if (SECRET_KEY) {
            return jwt.verify(token, SECRET_KEY);
        }
        return null;
    } catch (e) {

        return null;
    }
}
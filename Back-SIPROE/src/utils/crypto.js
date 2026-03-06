import crypto from "crypto";

export function encryptSHA256(text) {
    const hash = crypto.createHash("sha256");
    hash.update(text);
    return hash.digest("hex");
}
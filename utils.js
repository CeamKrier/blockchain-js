const crypto = require("crypto");
const elliptic = require("elliptic");
const bip39 = require("bip39");

const keyGenerator = new elliptic.eddsa("ed25519");

exports.getKeyGenerator = () => {
    return keyGenerator;
};

exports.generateKeyPair = mnemonic => {
    return this.getKeyGenerator().keyFromSecret(this.mnemonicToPrivateKey(mnemonic));
};

exports.generateMnemonic = () => {
    // 128 returns 13 word passphrase
    // 256 returns 25 word passphrase
    // word count formula: ((strength / 32) * 3) + 1 words
    return bip39.generateMnemonic(128);
};

exports.mnemonicToPrivateKey = mnemonic => {
    return bip39.mnemonicToSeedSync(mnemonic).toString("hex");
};

exports.generateHash = (data, algorithm = "sha256") => crypto.createHash(algorithm).update(JSON.stringify(data)).digest("hex");

exports.sleep = (duration = 1000) =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, duration);
    });

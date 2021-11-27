const { generateKeyPair, mnemonicToPrivateKey, generateHash } = require("./utils");
const { binary_to_base58 } = require("base58-js");

const addresses = {};

exports.getWallet = address => addresses[address];

/**
 * Reference: https://www.freecodecamp.org/news/how-to-create-a-bitcoin-wallet-address-from-a-private-key-eca3ddd9c05f/
 * @param {*} publicKey
 * @returns walletAddress
 */
const getWalletAddress = publicKey => {
    // Steps to obtain wallet address
    // 1- hash public key with sha256 algorithm
    const sha256hash = generateHash(publicKey);

    // 2- hash hashed value with ripemd160 algorithm
    const ripemd160hash = generateHash(sha256hash, "ripemd160");

    // 3- generate checksum
    // hash the hashed value twice with sha256 and get first 8 characters
    const checksum = generateHash(generateHash(ripemd160hash)).slice(0, 8);

    // 4- combine ripemd160hash with checksum and convert that to base58 (to get rid of mathematical expressions: + / *)
    const combinedHex = ripemd160hash + checksum;

    return binary_to_base58(Buffer.from(combinedHex));
};

const getWalletPublicKey = mnemonic => {
    const pair = this.getWalletKeyPair(mnemonic);
    return pair.getPublic("hex");
};

exports.getWalletKeyPair = mnemonic => {
    return generateKeyPair(mnemonic);
};

exports.createWallet = mnemonic => {
    const publicKey = getWalletPublicKey(mnemonic);

    const address = getWalletAddress(publicKey);

    if (!this.getWallet(address)) {
        addresses[address] = {
            balance: 0,
            transactions: []
        };
    }

    return address;
};

exports.getWalletPrivateKey = mnemonic => {
    const privateKey = mnemonicToPrivateKey(mnemonic);

    // check if this privateKey has a created wallet
    const publicKey = getWalletPublicKey(mnemonic);
    const walletAddress = getWalletAddress(publicKey);

    return this.getWallet(walletAddress) ? privateKey : undefined;
};

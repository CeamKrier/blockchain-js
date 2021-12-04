const { addBlock, getLastBlock, initialize, isChainAltered } = require("./blockchain");
const { createTransaction, signTransaction } = require("./transaction");
const { generateHash, sleep, generateMnemonic } = require("./utils");
const { createWallet, getWalletKeyPair, getWalletPrivateKey } = require("./wallet");

const ignite = async () => {
    const mnemonic = generateMnemonic();
    const keyPair = getWalletKeyPair(mnemonic);
    const privateKey = getWalletPrivateKey(mnemonic);

    console.log("mnemonic:  ", mnemonic);
    const ownerAddress = createWallet(mnemonic);
};

ignite();

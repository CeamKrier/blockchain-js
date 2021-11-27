const { addBlock, getLastBlock, initialize, isChainAltered } = require("./blockchain");
const { createTransaction } = require("./transaction");
const { generateHash, sleep, generateMnemonic } = require("./utils");
const { createWallet, getWalletKeyPair } = require("./wallet");

const ignite = async () => {
    const mnemonic = generateMnemonic();
    const keyPair = getWalletKeyPair(mnemonic);

    console.log("mnemonic:  ", mnemonic);
    const ownerAddress = createWallet(mnemonic);

    initialize(ownerAddress);

    console.log("Genesis block", getLastBlock());

    await sleep(1000);

    const txs = [createTransaction("aaa", "bbb", 10), createTransaction("c", "ddd", 5)];
    addBlock(txs);

    console.log("Second block", getLastBlock());

    console.log("Is chain altered", isChainAltered());
};

ignite();

const { initializeMiner } = require("./miner");
const { createTransaction } = require("./transaction");
const { generateHash, sleep, generateMnemonic } = require("./utils");
const { createWallet, getWalletPrivateKey } = require("./wallet");

const ignite = async () => {
    const mnemonic = generateMnemonic();
    console.log("Wallet mnemonic:", mnemonic);
    const ownerAddress = createWallet(mnemonic);
    console.log("Wallet address:", ownerAddress);
    const walletPrivate = getWalletPrivateKey(mnemonic);

    // Mint new tokens every 2 seconds for the wallet above
    setInterval(() => {
        console.log("Creating tx");
        createTransaction({ from: ownerAddress, to: ownerAddress, value: 100, privateKey: walletPrivate });
    }, 2000);

    console.log("Starting a miner");
    const minerMnemonic = generateMnemonic();
    console.log("Miner wallet mnemonic:", minerMnemonic);
    const minerWalletAddress = createWallet(minerMnemonic);
    initializeMiner({ minerId: minerWalletAddress }).startMiner();
};

ignite();

const { generate, mine, validate } = require("./block");
const { getMiningEventEmitter } = require("./blockchain");
const { getUnverifiedTransactions, validateTransaction, getMinableTransactions, updateTransactionState, getVerifiedTransactions } = require("./transaction");
const { transactionState, miningEvent } = require("./constants.json");
const { sleep, generateHash } = require("./utils");

let minerWalletAddress;
let isOn = true;

const verifyEmittedBlock = (emittedBlock, reject) => {
    // someone else found the block, verify it
    const isMineValid = validate(emittedBlock);

    if (isMineValid) {
        reject();
        // -- remove eventListeners
        getMiningEventEmitter().removeAllListeners(miningEvent.newBlockFound);
        // -- remove any intersecting transaction in emittedBlock and candidateBlock
        const remainingTxs = candidateBlock.transactions.filter(candidate => emittedBlock.transactions.find(mined => generateHash(mined.data) !== generateHash(candidate.data)));
        // -- rest of transactions should be send to mempool
        remainingTxs.forEach(tx => {
            const txHash = generateHash(tx.data);
            updateTransactionState(txHash, transactionState.signed);
        });
        // -- call back mineBlock again
        if (isOn) {
            mineBlock();
        }
    }
};

const mineBlock = async () => {
    const candidateBlock = generate();
    candidateBlock.transactions = await mineTransaction();

    const minedBlock = await new Promise((resolve, reject) => {
        // will be triggered if another miner found a block
        getMiningEventEmitter().addListener(miningEvent.newBlockFound, emittedBlock => {
            verifyEmittedBlock(emittedBlock, reject);
        });
        // stop mining
        getMiningEventEmitter().addListener(minerWalletAddress, reject);

        // resolve minedBlock
        resolve(mine(candidateBlock));
    }).catch(() => {
        return;
    });
    console.log("Mined a block", minedBlock.currentHash);
    // mined, emit message
    getMiningEventEmitter().emit(miningEvent.newBlockFound, minedBlock);
    // update tx state to verified
    candidateBlock.transactions.forEach(tx => {
        const txHash = generateHash(tx.data);
        updateTransactionState(txHash, transactionState.verified);
    });
    console.log("Verified count", getVerifiedTransactions().length);
    if (isOn) {
        mineBlock();
    }
};

const mineTransaction = async () => {
    const minedTxs = [];

    while (minedTxs.length < 10) {
        const utx = getUnverifiedTransactions();
        utx.forEach(validateTransaction);

        const availableTransactions = getMinableTransactions();

        if (availableTransactions.length) {
            for (let index = 0; index < availableTransactions.length; index++) {
                const txHash = generateHash(availableTransactions[index].data);
                console.log("tx added to candidate block. hash:", txHash);
                updateTransactionState(txHash, transactionState.includedToBlock);

                minedTxs.push(availableTransactions[index]);
                if (minedTxs.length === 10) {
                    break;
                }
            }
        }
        await sleep(1000);
    }

    return minedTxs;
};

exports.initializeMiner = ({ minerId }) => {
    minerWalletAddress = minerId;

    return this;
};

exports.startMiner = () => {
    isOn = true;
    mineBlock();
};

exports.stopMiner = () => {
    isOn = false;
    getMiningEventEmitter().emit(minerWalletAddress);
    getMiningEventEmitter().removeAllListeners(minerWalletAddress);
};

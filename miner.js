const { generate, mine, validate } = require("./block");
const { getMiningEventEmitter } = require("./blockchain");
const { getUnverifiedTransactions, validateTransaction, getSignedTransactions } = require("./transaction");
const { transactionState, miningEvent } = require("./constants.json");
const { sleep, generateHash } = require("./utils");

let minerId;
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
            tx.meta.state === transactionState.signed;
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

        // resolve minedBlock
        resolve(mine(candidateBlock));
    }).catch(() => {
        return;
    });

    // mined, emit message
    getMiningEventEmitter().emit(miningEvent.newBlockFound, minedBlock);
    if (isOn) {
        mineBlock();
    }
};

const mineTransaction = async () => {
    const utx = getUnverifiedTransactions();
    utx.forEach(validateTransaction);

    const minedTxs = [];

    while (minedTxs.length < 10) {
        const availableTransactions = getSignedTransactions();
        if (availableTransactions.length) {
            for (let index = 0; index < availableTransactions.length; index++) {
                availableTransactions[index].meta.state === transactionState.verified;
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

exports.initializeMiner = config => {
    minerId = config.MINER_ID;

    return this;
};

exports.startMiner = () => {
    isOn = true;
};

exports.stopMiner = () => {
    isOn = false;
};

const EventEmitter = require("events");
// const Block = require("./block");
const { createTransaction } = require("./transaction");
const Constants = require("./constants.json");
const { initializeMiner } = require("./miner");

const chain = [];
const miners = [];
const miningEventEmitter = new EventEmitter();
// Epoch will effect the way blockchain behave, this can be tought as the halving counter
let EPOCH = 1;
let CHAIN_MINING_DIFFICULITY = 2 + EPOCH;
let TOTAL_SUPPLY = 0;
let MAX_SUPPLY = 42000000;
let REWARD_PER_BLOCK = 50 / EPOCH;
let MINER_COUNT = 0;

exports.initialize = () => {};

exports.getMiningDifficulty = () => CHAIN_MINING_DIFFICULITY;

exports.getMiningEventEmitter = () => miningEventEmitter;

exports.getLastBlock = () => (chain.length ? chain[chain.length - 1] : undefined);

// exports.isChainAltered = () => {
//     if (chain.length === 1) {
//         return true;
//     }

//     return chain.some((block, index) => {
//         // Starting from the second block
//         if (index > 0) {
//             return !Block.validate(block);
//         }
//     });
// };

// exports.addBlock = transactions => {
//     const block = Block.generate(transactions);
//     block.previousHash = this.getLastBlock().currentHash;

//     const minedBlock = Block.mine(block, CHAIN_MINING_DIFFICULITY);

//     chain.push(minedBlock);
// };

exports.rewardBlockMiner = minerAddress => {
    if (TOTAL_SUPPLY + REWARD_PER_BLOCK <= MAX_SUPPLY) {
        const rewardTx = createTransaction(Constants.coinbase, minerAddress, REWARD_PER_BLOCK);

        // push verified tx to pool, miner will include it a block
    }

    return 0;
};

exports.registerNewMiner = () => {
    const config = {
        minerId: ++MINER_COUNT
    };

    const miner = initializeMiner(config);
    miner;
};

exports.getMiners = () => {
    return miners;
};

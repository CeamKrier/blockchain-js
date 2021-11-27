const Block = require("./block");
const { createTransaction } = require("./transaction");
const Constants = require("./constants.json");

const chain = [];
let CHAIN_MINING_DIFFICULITY = 3;

exports.initialize = ownerAddress => {
    if (!chain.length) {
        // Pre-mine some amount of currency
        // create tx
        // sign and send to blockchain
        // validate it on node
        // insert validated tx to a block
        // try to mine the block
        const genesisBlock = Block.generate([createTransaction(Constants.nullHash, ownerAddress, 100)]);
        chain.push(Block.mine(genesisBlock, CHAIN_MINING_DIFFICULITY));
    }
};

exports.getLastBlock = () => (chain.length ? chain[chain.length - 1] : undefined);

exports.isChainAltered = () => {
    if (chain.length === 1) {
        return true;
    }

    return chain.some((block, index) => {
        // Starting from the second block
        if (index > 0) {
            return !Block.validate(block);
        }
    });
};

exports.addBlock = transactions => {
    const block = Block.generate(transactions);
    block.previousHash = this.getLastBlock().currentHash;

    const minedBlock = Block.mine(block, CHAIN_MINING_DIFFICULITY);

    chain.push(minedBlock);
};

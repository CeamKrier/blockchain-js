const { getMiningDifficulty } = require("./blockchain");
const { generateHash } = require("./utils");

let BLOCK_COUNTER = 1;

exports.generate = transactions => ({
    blockNumber: undefined,
    timestamp: Date.now().toString(),
    transactions,
    previousHash: ""
});

exports.addTransactionToBlock = transaction => {};

// each miner will include highest fee paying transactions from mempool to their block
// transaction inclusion should be random, otherwise the node with best hash power always will be the one to mine block (centralized)
// there is also size limit, ex: BTC has 1mb + 3mb (virtual) block size limit so number of tx can be included on a block is deterministic
// -- once a transaction added to a block to be mined, those should be marked as "processing" to prevent them to be included other blocks
// -- after a miner find the solution to his block, other miners should validate result and send their transactions to mempool again
// -- mined transactions will be removed from the mempool
// -- -- transactions that were in other blocks than the mined one, should mark their transaction as "signed"
// -- -- those transactions will be re-validated
// there is an edge case where a block can be mined more than one miner at almost the same time
// -- an accidential fork will be happening in that case:
// -- --               [f1] - ... - [] - ...
// -- --              /
// -- -- [] - [] - []
// -- --              \
// -- --                [f2] - ... - discontinued, because there is higher block on the chain
// -- -- eventually, a fork will have a longer block height (number of total mined blocks)
// -- -- -- then transactions inside short blocks (orphaned blocks) will be dumped back to mempool(!), transactions reverted(!)(!)
// -- -- -- those tranactions will be re-validated and will be added on next blocks
// -- -- -- basically, network will re-use the signed transactions of those blocks and fulfill them

exports.mine = block => {
    // generate an iteration counter, named as nonce
    // this will keep the number of tries to mine a block
    block.nonce = 1;

    // searching repeated number of 0's
    const hasMined = () => {
        const searchTerm = "0".repeat(getMiningDifficulty());
        const hash = generateHash(block);

        return hash.startsWith(searchTerm);
    };

    while (!hasMined()) {
        block.nonce += 1;
    }

    BLOCK_COUNTER += 1;

    block.currentHash = generateHash(block);
    block.blockNumber = BLOCK_COUNTER;

    // add block information to the tx's
    // we can directly access to the tx's with the block information
    block.transactions = block.transactions.map(tx => {
        tx.meta.block = BLOCK_COUNTER;
        return tx;
    });

    return block;
};

exports.validate = block => {
    const { currentHash } = block;

    // we need block data without the currentHash, removing currentHash
    delete block.currentHash;
    return generateHash(block) === currentHash;
};

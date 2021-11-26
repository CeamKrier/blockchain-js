const { generateHash } = require("./utils");
const Constants = require("./constants.json");

exports.generate = transactions => ({
    timestamp: Date.now().toString(),
    transactions,
    previousHash: Constants.nullHash
});

exports.mine = (block, difficulty) => {
    // generate an iteration counter, named as nonce
    // this will keep the number of tries to mine a block
    block.nonce = 1;

    // searching repeated number of 0's
    const hasMined = () => {
        const searchTerm = "0".repeat(difficulty);
        const hash = generateHash(block);

        return hash.startsWith(searchTerm);
    };

    while (!hasMined()) {
        block.nonce += 1;
    }

    block.currentHash = generateHash(block);

    return block;
};

exports.validate = block => {
    const { currentHash } = block;

    // we need block data without the currentHash, removing currentHash
    delete block.currentHash;
    return generateHash(block) === currentHash;
};

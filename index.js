const { addBlock, getLastBlock, initialize, isChainAltered } = require("./blockchain");
const { transaction } = require("./transaction");
const { generateHash, sleep } = require("./utils");

const ignite = async () => {
    const ownerAddress = generateHash("hello");

    initialize(ownerAddress);

    console.log("Genesis block", getLastBlock());

    await sleep(1000);

    const txs = [transaction("aaa", "bbb", 10), transaction("c", "ddd", 5)];
    addBlock(txs);

    console.log("Second block", getLastBlock());

    console.log("Is chain altered", isChainAltered());
};

ignite();

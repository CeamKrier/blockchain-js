const { generateHash } = require("./utils");

exports.transaction = (from, to, value) => {
    const tx = { from, to, value };

    return {
        txHash: generateHash(tx),
        from,
        to,
        value
    };
};

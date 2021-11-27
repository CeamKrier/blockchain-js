const { generateHash, getKeyGenerator } = require("./utils");
const { transactionState } = require("./constants.json");

exports.createTransaction = (from, to, value) => {
    return {
        meta: {},
        data: {
            from,
            to,
            value
        }
    };
};

exports.signTransaction = (transaction, privateKey) => {
    const signature = getKeyGenerator().sign(generateHash(transaction.data), privateKey).toHex();
    transaction.meta = {
        ...transaction.meta,
        signature,
        state: transactionState.signed
    };

    return transaction;
};

exports.validateTransaction = transaction => {
    const isValid = getKeyGenerator().verify(generateHash(transaction.data), transaction.meta.signature);
    transaction.meta.state = isValid ? transactionState.confirmed : transactionState.failed;

    return transaction;
};

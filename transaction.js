const { generateHash, getKeyGenerator, getPublicFromPrivateKey } = require("./utils");
const { transactionType, transactionState, transactionFailReason, coinbase } = require("./constants.json");
const { getWalletBalance } = require("./wallet");

const mempool = {};

exports.getTransaction = txHash => mempool[txHash];
exports.updateTransactionState = (txHash, state) => (mempool[txHash] = { ...mempool[txHash], meta: { ...mempool[txHash].meta, state } });

exports.createTransaction = ({ from, to, value, privateKey }) => {
    const transaction = {
        meta: {},
        data: {
            timestamp: Date.now().toString(),
            from,
            to,
            value
        }
    };

    const utxo = getWalletBalance({ privateKey });

    // Sign transaction

    const isMintingToken = transaction.from === coinbase;
    const txHash = generateHash(transaction.data);

    if (!isMintingToken && from !== to) {
        const signature = getKeyGenerator().sign(txHash, privateKey).toHex();

        transaction.meta = {
            signature,
            state: transactionState.signed
        };

        utxo.value -= value;
    } else {
        transaction.meta = {
            state: transactionState.minable,
            type: transactionType.mintToken
        };

        utxo.value += value;
    }

    mempool[txHash] = transaction;
    console.log("Tx count in pool", Object.keys(mempool).length);
    return transaction;
};

exports.validateTransaction = transaction => {
    // only try to validate signed tx's
    if (transaction.meta.state !== transactionState.signed) {
        return false;
    }

    // Control the source by validating the signature
    const txHash = generateHash(transaction.data);
    const isValid = getKeyGenerator().verify(txHash, transaction.meta.signature);

    if (isValid) {
        // Mark tx as minable
        transaction.meta.state = transactionState.minable;

        // update record, this will be added to a block by a miner
        mempool[txHash] = transaction;

        return true;
    } else {
        const failReasons = [];
        if (!isValid) {
            failReasons.push(transactionFailReason.signature_failed_to_verify);
        }

        transaction.meta.state = transactionState.failed;
        transaction.meta.failReasons = failReasons;
    }
    console.log("mempool", mempool);
    return false;
};

exports.getUnverifiedTransactions = () => {
    // @TODO: add tx fee, sort pool for tx fee
    return Object.keys(mempool)
        .filter(tx => mempool[tx].meta.state === transactionState.signed)
        .map(hash => mempool[hash]);
};

exports.getMinableTransactions = () => {
    return Object.keys(mempool)
        .filter(tx => mempool[tx].meta.state === transactionState.minable)
        .map(hash => mempool[hash]);
};

exports.getVerifiedTransactions = () => {
    return Object.keys(mempool)
        .filter(tx => mempool[tx].meta.state === transactionState.verified)
        .map(hash => mempool[hash]);
};

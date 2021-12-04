const { generateHash, getKeyGenerator, getPublicFromPrivateKey } = require("./utils");
const { transactionType, transactionState, transactionFailReason, coinbase } = require("./constants.json");
const { getWalletBalance } = require("./wallet");

const mempool = {};

exports.createTransaction = ({ from, to, value, privateKey }) => {
    const transaction = {
        meta: {},
        data: {
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
            state: transactionState.verified,
            type: transactionType.mintToken
        };

        utxo.value += value;
    }

    mempool[txHash] = transaction;

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
        // Mark tx as verified
        transaction.meta.state = transactionState.verified;

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

    return false;
};

exports.getUnverifiedTransactions = () => {
    // @TODO: add tx fee, sort pool for tx fee
    return Object.keys(mempool).filter(tx => mempool[tx].meta.state === transactionState.signed);
};

exports.getVerifiedTransactions = () => {
    return Object.keys(mempool).filter(tx => mempool[tx].meta.state === transactionState.verified);
};

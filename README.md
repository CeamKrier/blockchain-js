# Blockchain with JS

A basic blockchain implementation that uses a proof-of-work consensus algorithm written in javascript.

## Transaction

Holds necessary info like who is the sender, receiver and the amount subject to trade.

Structure of transaction data:

```js
{
    meta: {
        state: signed | minable | includedToBlock | failed | verified,
        signature: generated on sign
    },
    data: {
        timestamp: generated on tx creation,
        from: sender address,
        to: receiver address,
        value: amount sent
}
```

### Life-cycle of Transaction

-   _*signed*_: Transaction generated, balance of sender controlled and it is adequate to carry out transaction. Transaction signed with `transaction.data` and the privateKey of sender's wallet. Value saved on `transaction.meta.signature`.

-   _*minable*_: A signed transaction reach to the miner, miner validates signature to be sure the sender is legit. If transaction signature is valid then `transaction.meta.state` set to `minable` or it set to `failed`.

-   _includedToBlock_: A minable transaction taken by a miner and included its candidate block. Mostly, this selection depends on the transaction fee paid by the sender, higher the fee faster the inclusion into a block, but I skipped that to keep things simple. Then `transaction.meta.state` set to `includedToBlock`.

-   _verified_: Transaction inside a candidate block has mined and added to blockchain, all the transactions inside it will be updated as `verified`.

-   _failed_: Transaction failed for a reason and discarded.

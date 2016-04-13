# easy-bitcoin-js

A simple module with basic Bitcoin operations using [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [Blockchain.info API](http://blockchain.info).

[![Build Status](https://travis-ci.org/ggondim/easy-bitcoin-js.svg?branch=master)](https://travis-ci.org/ggondim/easy-bitcoin-js)

[![npm package](https://nodei.co/npm/easy-bitcoin-js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/easy-bitcoin-js/)

### Super simple to use

```javascript
var easyBtc = require('easy-bitcoin-js');
```

### Development status

> **Some features are in alpha.** This means some operations, even if they are complete, are under development and were not tested. Tested features are documented with ![Done and tested](https://www.easydna.co.uk/wp-content/themes/easydna1/images/icon-check.png) icon.

[There is a milestone](https://github.com/ggondim/easy-bitcoin-js/milestones/v1) of pending tasks until we release it as a stable v1.  

### Features

- [Creating a random new wallet](https://github.com/ggondim/easy-bitcoin-js/blob/master/README.md#easybtcnewwallet)
- [Getting a wallet from the Blockchain and it's current balance](https://github.com/ggondim/easy-bitcoin-js/blob/master/README.md#easybtcgetwallet)
- [Creating a transaction and getting it's hex script](https://github.com/ggondim/easy-bitcoin-js/blob/master/README.md#easybtcnewtransaction)
- [Pushing a transaction to the Blockchain](https://github.com/ggondim/easy-bitcoin-js/blob/master/README.md#easybtcpushtransaction)
- [Getting a transaction from the Blockchain and it's confirmation](https://github.com/ggondim/easy-bitcoin-js/blob/master/README.md#easybtcgettransaction)

#### newWallet() ![Done and tested](https://www.easydna.co.uk/wp-content/themes/easydna1/images/icon-check.png)
Creates a random new wallet.

##### Returns
- [Object] `$$ecPair`: bitcoinjs keyPair object
- [String] `wif`: private key in WIF format
- [String] `address`: public key (address)


#### getWallet(address) ![Done and tested](https://www.easydna.co.uk/wp-content/themes/easydna1/images/icon-check.png)
Gets information from an address in the blockchain.

##### Arguments
- [String] `address`: the address of the wallet.

##### Returns
- [Promise] A Q promise with the HTTP result. JSON result is resolved to `resolved.data`.

> **Tip**: the returned `final_balance` property of the transaction JSON contains the wallet's balance.


#### newTransaction(fromWIF, txHashOrigin, toAddress, value)
Creates a transaction.

##### Arguments
- [String] `fromWIF`: private key in WIF format of the origin wallet.
- [String] `txHashOrigin`: the last transaction hash to the origin wallet.
- [String] `toAddress`: the public key (address) of the destination wallet.
- [Number, int] `value`: the amount to transfer in uBTC (microbitcoins).

##### Returns
- [Object] `$$tx`: bitcoinjs transaction object.
- [String] `hex`: the transaction hex script to push into the blockchain.


#### pushTransaction(hexTx)
Pushes a transaction to the blockchain.

##### Arguments
- [String] `hexTx`: the transaction hex script to push into the blockchain.

##### Returns
- [Promise] A Q promise with the HTTP result.


#### getTransaction(txHash)
Gets a transaction from the blockchain.

##### Arguments
- [String] `hexTx`: the transaction hex script to push into the blockchain.

##### Returns
- [Promise] A Q promise with the HTTP result. JSON result is resolved to `resolved.data`.

> **Tip**: the returned `block_height` property of the transaction JSON is present and greater than zero if the transaction is already confirmed. If this property is not present in the JSON or equal to or less than zero, the transaction was not already confirmed.


### Under development

>**THE FOLLOWING OPERATIONS ARE UNDER DEVELOPMENT.** This means they are incomplete, not working or unstable.

#### decodeTransaction(hex)
Decodes a transaction from its hex script.

**Status**: need to parse Blockchain.info HTML reponse and extract transaction JSON from a `<pre>` tag.

#### createPushAndConfirmTransaction(fromWIF, txHashOrigin, toAddress, value, opt_timeout, opt_interval)
Creates, pushes and awaits for a transaction confirmation.

**Status**: Done, just waiting for the `decodeTransaction` method to be completed.

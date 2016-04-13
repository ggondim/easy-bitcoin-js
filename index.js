(function(bitcoin, request, Q) {
    'use strict';

    var BLOCKCHAIN_API = {
        GET_ADDRESS: 'https://blockchain.info/pt/address/$address',
        GET_RAW_TX: 'https://blockchain.info/pt/rawtx/$txHash',
        PUSH_TX: 'https://blockchain.info/pt/pushtx',
        DECODE_TX: 'https://blockchain.info/pt/decode-tx',
    };

    var ERR_MESSAGES = {
        TRANSACTION_PUSH: 'Error on [pushTransaction]',
        TRANSACTION_DECODE: 'Could not decode the hex of created transaction',
        TRANSACTION_CONFIRMATION_REQUEST: 'Error when requesting confirmation for the transaction',
        TRANSACTION_CONFIRMATION_TIMEOUT: 'Confirmation timeout reached'
    };


    /**
     * newWallet - Creates a random new wallet (keypair composed by a private key in WIF format and a public key - address).
     *
     * @return {object}
     */
    exports.newWallet = function() {
        var keyPair = bitcoin.ECPair.makeRandom();
        return {
            $$ecPair: keyPair,
            wif: keyPair.toWIF(),
            address: keyPair.getAddress()
        };
    }


    /**
     * getWallet - Gets information from an address in the blockchain.
     *
     * @param  {string} address The address of the wallet.     
     * @return {Promise}         description
     */
    exports.getWallet = function(address) {
        var deffered = Q.defer();
        request.get({
            url: BLOCKCHAIN_API.GET_ADDRESS.replace('$address', address),
            qs: {
                format: 'json'
            },
            json: true
        }, function(err, httpResponse, body) {
            if (err) {
                deffered.reject(err);
            } else {
                var wallet = body;
                body.$$httpResponse = httpResponse;
                deffered.resolve(wallet);
            }
        });
        return deffered.promise;
    }

    exports.newTransaction = function(fromWIF, txHashOrigin, toAddress, value) {
        var kpFrom = bitcoin.ECPair.fromWIF(fromWIF);
        var tx = new bitcoin.TransactionBuilder();
        tx.addInput(txHashOrigin, 0);
        tx.addOutput(toAddress, value);
        tx.sign(0, kpFrom);
        return {
            $$tx: tx,
            hex: tx.build().toHex()
        };
    }

    exports.getTransaction = function(txHash) {
        var deffered = Q.defer();
        request.get({
            url: BLOCKCHAIN_API.GET_RAW_TX.replace('$txHash', txHash),
            json: true
        }, function(err, httpResponse, body) {
            if (err) {
                deffered.reject(err);
            } else {
                var transaction = body;
                transaction.$$httpResponse = httpResponse;
                deffered.resolve(transaction);
            }
        });
        return deffered.promise;
    }

    exports.pushTransaction = function(hexTx) {
        var deffered = Q.defer();
        request.post({
            url: BLOCKCHAIN_API.PUSH_TX,
            form: {
                tx: hexTx
            }
        }, function(err, httpResponse, body) {
            if (err) {
                deffered.reject(err);
            } else {
                deffered.resolve({
                    httpResponse: httpResponse,
                    data: body
                });
            }
        });
        return deffered.promise;
    }

    exports.decodeTransaction = function(hex) {
        request.post({
            url: BLOCKCHAIN_API.DECODE_TX,
            form: {
                tx: hex
            }
        }, function(err, httpResponse, body) {
            if (err) {

            } else {
                // TODO: parse HTML result and parse JSON decoed trnsaction from <pre class="prettyprint">
            }
        });
    }

    exports.createPushAndConfirmTransaction = function(fromWIF, txHashOrigin, toAddress, value, opt_timeout, opt_interval) {
        var timeout = (opt_timeout || null) === null ? /* 1.5 hour */ 90 * 60 * 1000 : parseInt(opt_timeout);
        var interval = (opt_interval || null) === null ? /* 1 minute */ 60 * 1000 : parseInt(opt_interval);
        var deffered = Q.defer();
        var transaction = exports.newTransaction(fromWIF, txHashOrigin, toAddress, value);
        var txId = '';
        exports.decodeTransaction(transaction.hex)
            .then(function(txJson) {
                txId = txJson.hash;
                return exports.pushTransaction(transaction.hex);
            })
            .catch(function(error) {
                deffered.reject(new TransactionOperationError(false, ERR_MESSAGES.TRANSACTION_DECODE, error));
            })
            .then(function() {
                var maxTimeout = 0;
                var timer = setInterval(function() {
                    if (maxTimeout <= timeout) {
                        exports.getTransaction(txId)
                            .then(function(transactionResult) {
                                if (result.block_height > 0) {
                                    deffered.resolve(new TransactionOperationResult(transaction, transactionResult, txId));
                                }
                            })
                            .catch(function(error) {
                                deffered.reject(new TransactionOperationError(true, ERR_MESSAGES.TRANSACTION_CONFIRMATION_REQUEST, error));
                                clearInterval(timer);
                            });
                        maxTimeout = interval + maxTimeout;
                    } else {
                        deffered.reject(new TransactionOperationError(true, ERR_MESSAGES.TRANSACTION_CONFIRMATION_TIMEOUT, error));
                        clearInterval(timer);
                    }
                }, interval);
            })
            .catch(function(error) {
                deffered.reject(new TransactionOperationError(false, ERR_MESSAGES.TRANSACTION_PUSH, error));
            });
        return deffered.promise;
    }

    function TransactionOperationError(isPushed, reason, opt_error) {
        this.txPushed = isPushed;
        this.reason = reason;
        this.error = opt_error || null;
    }

    function TransactionOperationResult(txSent, txConfirmed, decodedHash) {
        this.txSent = sentTx;
        this.txConfirmed = confirmedTx;
        this.decodedHash = decodedHash;
    }

}(require('bitcoinjs-lib'), require('request'), require('q')));

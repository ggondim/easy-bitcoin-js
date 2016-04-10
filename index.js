(function(bitcoin, request, Q) {
    'use strict';

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

    exports.newWallet = function() {
        var keyPair = bitcoin.ECPair.makeRandom();
        return {
            $$ecPair: keyPair,
            wif: keyPair.toWIF(),
            address: keyPair.getAddress()
        };
    }

    exports.pushTransaction = function(hexTx) {
        var deffered = Q.defer();
        request.post({
            url: 'https://blockchain.info/pt/pushtx',
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

    exports.getTransaction = function(txHash) {
        var url = 'https://blockchain.info/pt/rawtx/' + txHash;
        var deffered = Q.defer();
        request.get({
            url: url,
            json: true
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

    exports.getWallet = function(address) {
        var url = 'https://blockchain.info/pt/address/' + txHash;
        var deffered = Q.defer();
        request.get({
            url: url,
            qs: {
                format: 'json'
            },
            json: true
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

    exports.decodeTransaction = function (hex) {
        request.post({
            url: 'https://blockchain.info/pt/decode-tx',
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
            .then(function (txJson) {
                txId = txJson.hash;
                return exports.pushTransaction(transaction.hex);
            })
            .catch(function (error) {
                deffered.reject({
                    txPushed: false,
                    reason: 'Could not decode the hex of created transaction',
                    error: error
                });
            });
            .then(function() {
                var maxTimeout = 0;
                var timer = setInterval(function() {
                    if (maxTimeout <= timeout) {
                        exports.getTransaction(txId)
                            .then(function (result) {
                                if (result.data.block_height > 0) {
                                    deffered.resolve({
                                        txPushed: true,
                                        confirmationTx: result.data,
                                        createdTx: transaction,
                                        decodedHash: txId
                                    });
                                }
                            })
                            .catch(function (error) {
                                deffered.reject({
                                    txPushed: true,
                                    reason: 'Error when requesting confirmation for the transaction',
                                    timeout: timeout
                                });
                                clearInterval(timer);
                            });
                        maxTimeout = interval + maxTimeout;
                    } else {
                        deffered.reject({
                            txPushed: true,
                            reason: 'Confirmation timeout reached',
                            timeout: timeout
                        });
                        clearInterval(timer);
                    }
                }, interval);
            })
            .catch(function(error) {
                deffered.reject({
                    txPushed: false,
                    reason: 'Error on pushTransaction',
                    error: error
                });
            });
        return deffered.promise;
    }

}(require('bitcoinjs-lib'), require('request'), require('q')));

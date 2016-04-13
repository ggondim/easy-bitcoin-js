var expect = require('chai').expect;
var easybtc = require('../index.js');

describe('easy-bitcoin-js', function() {

    describe('newWallet', function() {
        var wallet;

        before(function() {
            wallet = easybtc.newWallet();
        });

        it('should return a valid private key in WIF format', function() {
            expect(wallet)
                .to
                .include.keys('wif');

            expect(wallet.wif)
                .to
                .be.a('string')
                .with.length.above(1)
                .that.is.equal(wallet.$$ecPair.toWIF());
        });

        it('should return a valid public key address', function() {
            expect(wallet)
                .to
                .include.keys('address');

            expect(wallet.address)
                .to
                .be.a('string')
                .with.length.above(1)
                .that.is.equal(wallet.$$ecPair.getAddress());
        });
    });

    describe('getWallet', function() {
        var invalidAddress = '123456';
        var unknownAddress = easybtc.newWallet().address;
        var validAddress = '1FAv42GaDuQixSzEzSbx6aP1Kf4WVWpQUY';

        it('should return null for an invalid address');
        it('should return null for an unknown address');

        it('should return a fulfilled address object for a valid address', function() {
            return easybtc.getWallet(validAddress)
                .then(function(result) {
                    expect(result)
                        .to
                        .include.key('address');

                    expect(result)
                        .to
                        .include.key('final_balance');
                })
        });
    });

    describe('newTransaction', function() {
        it('should return a valid hex script');
    });

    describe('pushTransaction', function() {
        it('should succeed if the transaction was pushed into the blockchain');
        it('should fail if the transaction was not pushed into the blockchain');
    });

    describe('getTransaction', function() {
        it('should return null for an invalid transaction hash');
        it('should return a fulfilled transaction object for a valid address');
    });

    describe('decodeTransaction', function() {
        it('should return null for an invalid hex script');
        it('should return a fulfilled transaction object for a valid hex script');
    });

    describe('createPushAndConfirmTransaction', function() {
        it('should fail if the time was out');
        it('should wait to confirm the transaction');
    });
});

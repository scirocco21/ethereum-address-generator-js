
const BIP39 = require("bip39");
const hdkey = require('ethereumjs-wallet/hdkey');
const keccak256 = require('js-sha3').keccak256;
const Wallet = require('ethereumjs-wallet');

// Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
function generateMnemonic(){
  return BIP39.generateMnemonic()
}
//generate Seed from mnemonic
function generateSeed(mnemonic){
  return BIP39.mnemonicToSeed(mnemonic)
}
// derive private key from Seed
function generatePrivKey(mnemonic){
  const seed = generateSeed(mnemonic)
  return hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0/0`).getWallet().getPrivateKey()
}
// derive public key from private
function derivePubKey(privKey){
  const wallet = Wallet.fromPrivateKey(privKey)    
  return wallet.getPublicKey()
}

function deriveEthAddress(pubKey){
  const address = keccak256(pubKey) // keccak256 hash of  publicKey
  // Get the last 20 bytes (=40 chars) of the hashed public key
  return "0x" + address.substring(address.length - 40, address.length)    
}

var mnemonicVue = new Vue({
    el:"#app",
    data: {  
        mnemonic: "",
        privKey: "",
        pubKey: "",
        ETHaddress: "",
        sampleTransaction: {
            nonce: '0x00',
            gasPrice: '0x09184e72a000', 
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6', 
            value: '0x10', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        signedSample: {},
        recoveredAddress: ""
    },
    methods:{
        generateNew: function(){
            this.mnemonic = generateMnemonic()
        },
        signSampleTx: function(){
            this.signedSample = signTx(this.privKey, this.sampleTransaction)
            console.log("signed Sample", this.signedSample)
        }
    },
    watch: {
        mnemonic: function(val){
            this.privKey = generatePrivKey(val)
        },
        privKey: function(val){
            this.pubKey = derivePubKey(val)
        },
        pubKey: function(val){
            this.ETHaddress = deriveEthAddress(val)
            this.recoveredAddress = ""
        },
        signedSample: function(val){
            this.recoveredAddress = getSignerAddress(val)
        }
    }
})

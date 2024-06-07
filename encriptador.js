const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

function loadKeys() {
  const publicKeyPem = fs.readFileSync(path.join(__dirname, 'keys', 'publicKey.pem'), 'utf8');
  const privateKeyPem = fs.readFileSync(path.join(__dirname, 'keys', 'privateKey.pem'), 'utf8');
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  return { publicKey, privateKey };
}

function encrypt(data, publicKey) {
  return forge.util.encode64(publicKey.encrypt(forge.util.encodeUtf8(data)));
}

function decrypt(encryptedData, privateKey) {
  return forge.util.decodeUtf8(privateKey.decrypt(forge.util.decode64(encryptedData)));
}

module.exports = {
  loadKeys,
  encrypt,
  decrypt
};

const NodeRSA = require('node-rsa');

// Generate a new RSA key pair
const key = new NodeRSA({ b: 512 });

// Export the public and private keys
const publicKey = key.exportKey('public');
const privateKey = key.exportKey('private');

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// Encrypt a message with the public key
const message = 'Hellllllllllllllllll';
const encrypted = key.encrypt(message, 'base64');
console.log('Encrypted:', encrypted);

// Decrypt the message with the private key
const decrypted = key.decrypt(encrypted, 'utf8');
console.log('Decrypted:', decrypted);
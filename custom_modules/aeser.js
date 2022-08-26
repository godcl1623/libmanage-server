const CryptoJS = require('crypto-js');

module.exports = {
  encryptor: (object, key) => CryptoJS.AES.encrypt(JSON.stringify(object), key).toString(),

  decryptor: (ciphered, key) => {
    const decrypted = CryptoJS.AES.decrypt(ciphered, key);
  
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}

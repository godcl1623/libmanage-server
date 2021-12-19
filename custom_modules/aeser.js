const CryptoJS = require('crypto-js');

module.exports = {
  // encryptor: (string, key) => CryptoJS.AES.encrypt(string, key).toString(),

  // decryptor: (ciphered, key) => {
  //   const decrypted = CryptoJS.AES.decrypt(ciphered, key);
  
  //   return decrypted.toString(CryptoJS.enc.Utf8);
  // },

  encryptor: (object, key) => CryptoJS.AES.encrypt(JSON.stringify(object), key).toString(),

  decryptor: (ciphered, key) => {
    const decrypted = CryptoJS.AES.decrypt(ciphered, key);
  
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}

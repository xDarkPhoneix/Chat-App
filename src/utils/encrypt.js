import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.CHAT_SECRET; // Use .env in production

// Encrypt message
export const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

// Decrypt message
export const decryptMessage = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

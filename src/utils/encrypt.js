import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import forge from "node-forge";

/**
 * Generate signature using HMAC MD5
 * @param {string} str
 * @returns {string}
 */
export function generateSignature(str) {
  const signKey = import.meta.env.VITE_SIGN_KEY;
  if (!signKey) {
    throw new Error("REACT_APP_SIGN_KEY is not defined.");
  }
  return CryptoJS.HmacMD5(str, signKey).toString();
}

// /**
//  * RSA encryption using `jsencrypt`
//  * @param {string} data - The data to encrypt
//  * @param {string} key - The RSA public key
//  * @return {string} - The encrypted data in URL-safe base64 encoding
//  */

export function encryptWithRsa(data, key) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(key);
  const encrypted = encrypt.encrypt(data);
  if (!encrypted) {
    throw new Error("RSA encryption failed.");
  }

  return urlSafeB64encode(encrypted);
}

/**
 * URL-safe base64 encoding
 * @param {string} data - The Base64 encoded data
 * @return {string} - URL-safe Base64 encoded data
 */

// // /**
//  * URL-safe base64 encoding
//  * @param {string} data - The base64 encoded data
//  * @return {string} - URL-safe base64 encoded data
//  */
export function urlSafeB64encode(data) {
  return data.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export class RSAEncryptor {
  constructor(publicKeyPem, keySize) {
    this.publicKey = forge.pki.publicKeyFromPem(publicKeyPem); // Load the public key
    this.k = keySize / 8; // Key size in bytes
  }

  // PKCS#1 chunked encryption
  encryptPKCS1(plaintext) {
    const maxLength = this.k - 11; // Maximum chunk size (key size - PKCS#1 padding overhead)
    if (maxLength <= 0) {
      throw new Error("Invalid key size for PKCS#1 encryption.");
    }

    // Convert plaintext to binary format (UTF-8 encoding)
    const binaryData = forge.util.encodeUtf8(plaintext);

    // Split binary data into chunks
    const chunks = this._splitIntoChunks(binaryData, maxLength);

    // Encrypt each chunk and concatenate the binary encrypted data
    const encryptedChunks = chunks.map((chunk) =>
      this._rsaesPkcs1V15Encrypt(chunk)
    );

    // Concatenate all encrypted binary chunks
    const concatenatedCiphertext = encryptedChunks.join("");

    // Encode the concatenated ciphertext to Base64
    return forge.util.encode64(concatenatedCiphertext);
  }

  // Helper method: split plaintext into chunks
  _splitIntoChunks(data, length) {
    const chunks = [];
    for (let i = 0; i < data.length; i += length) {
      chunks.push(data.slice(i, i + length));
    }
    return chunks;
  }

  // Helper method: encrypt a single chunk with PKCS#1 v1.5
  _rsaesPkcs1V15Encrypt(data) {
    return this.publicKey.encrypt(data, "RSAES-PKCS1-V1_5"); // PKCS#1 v1.5 padding encryption
  }
}

/**
 * AES decryption using `crypto-js`
 * @param {string} data - The data to decrypt
 * @return {object | null} - The decrypted data as a JSON object, or null if decryption fails
 */
export function decryptWithAes(data) {
  try {
    // Decode the encrypted data (if URL-safe base64 encoding was used)
    const encryptedData = data.replace(/-/g, "+").replace(/_/g, "/"); // Convert URL-safe base64 to standard base64

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_KEY || ""),
      {
        iv: CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_IV || ""),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert decrypted data to string
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

    // Parse the JSON string to an object
    return JSON.parse(decryptedStr);
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
}

/**
 * URL-safe base64 decoding
 * @param {string} data
 * @returns {string}
 */
export function urlSafeB64decode(data) {
  return data.replace(/-/g, "+").replace(/_/g, "/");
}

/**
 * Convert URL parameters to FormData
 * @param {string} url
 * @returns {object}
 */
function convertUrlToFormData(url) {
  const params = new URLSearchParams(url);
  const formData = { timestamp: new Date().getTime() };

  for (const [key, value] of params.entries()) {
    formData[key] = isNaN(value) ? value : Number(value); // Convert numeric strings to numbers
  }

  return formData;
}

/**
 * Create secure URL with encrypted parameters
 * @param {string} base
 * @param {object} formData
 * @returns {string}
 */
function createSecureUrl(base, formData) {
  const publicKey = import.meta.env.VITE_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const encrypted = encryptWithRsa(JSON.stringify(formData), publicKey);
  const signature = generateSignature(encrypted);

  return `${base}?pack=${encodeURIComponent(
    encrypted
  )}&signature=${encodeURIComponent(signature)}`;
}

/**
 * Convert API URL to secure URL
 * @param {string} apiUrl
 * @returns {string}
 */
export function convertToSecureUrl(apiUrl) {
  const [base, query] = apiUrl.split("?", 2); // Split URL into base and query string
  const formData = query
    ? convertUrlToFormData(query)
    : { timestamp: new Date().getTime() };

  return createSecureUrl(base, formData);
}

/**
 * Convert form data to secure payload
 * @param {object} formData
 * @returns {object}
 */
export function convertToSecurePayload(formData) {
  const publicKey = import.meta.env.VITE_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  formData["timestamp"] = new Date().getTime();
  const encrypted = encryptWithRsa(JSON.stringify(formData), publicKey);
  const signature = generateSignature(encrypted);
  return {
    pack: encrypted,
    signature: signature,
  };
}

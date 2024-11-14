const ENCRYPTION_KEY = 'YourSecretEncryptionKey'; // Replace with a strong, unique key

// Convert string to ArrayBuffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Convert ArrayBuffer to string
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Derive a key from a password
async function deriveKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('SaltySalt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data) {
  const enc = new TextEncoder();
  const key = await deriveKey(ENCRYPTION_KEY);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = enc.encode(data);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedData
  );

  const encryptedContentArr = new Uint8Array(encryptedContent);
  const buf = new Uint8Array(iv.byteLength + encryptedContentArr.byteLength);
  buf.set(iv, 0);
  buf.set(encryptedContentArr, iv.byteLength);

  return btoa(ab2str(buf));
}

export async function decryptData(encryptedData) {
  if (!encryptedData) return null;

  const enc = new TextEncoder();
  const key = await deriveKey(ENCRYPTION_KEY);

  const encryptedDataBuf = str2ab(atob(encryptedData));
  const iv = encryptedDataBuf.slice(0, 12);
  const data = encryptedDataBuf.slice(12);

  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (e) {
    console.error('Decryption failed', e);
    return null;
  }
}
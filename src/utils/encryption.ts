// Simple encryption for token storage
// In production, use a more secure encryption method and store keys securely
const ENCRYPTION_KEY = 'your-secret-key';

export const encryptData = (text: string): string => {
  if (!text) return '';
  
  try {
    // First convert to base64 to handle special characters
    const base64 = btoa(encodeURIComponent(text));
    
    // Then apply XOR encryption
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code: number) => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

    return base64
      .split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decryptData = (encoded: string): string => {
  if (!encoded) return '';
  
  try {
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = (code: number) => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);
    
    const decoded = encoded
      .match(/.{1,2}/g)!
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');

    // Decode base64 and URI components
    return decodeURIComponent(atob(decoded));
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
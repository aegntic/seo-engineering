/**
 * SimHash implementation for content fingerprinting
 * 
 * SimHash is a technique for quickly estimating how similar two sets are.
 * It creates a fingerprint of a document that can be used to detect 
 * near-duplicate content efficiently.
 * 
 * Reference: "Detecting Near-Duplicates for Web Crawling" by Gurmeet Singh Manku, Arvind Jain, 
 * and Anish Das Sarma (Google, Inc.)
 * 
 * @module duplicate-content/fingerprinter/simhash
 */

const crypto = require('crypto');

/**
 * SimHash implementation
 */
const simhash = {
  /**
   * Compute SimHash for a list of tokens
   * @param {Array<string>} tokens - List of tokens from the document
   * @param {number} bitLength - Length of the hash in bits (default: 64)
   * @returns {string} SimHash value as a hexadecimal string
   */
  compute(tokens, bitLength = 64) {
    if (!tokens || tokens.length === 0) {
      return '0'.repeat(bitLength / 4); // Return zero hash for empty content
    }

    // Initialize vector with zeros
    const vector = new Array(bitLength).fill(0);
    
    // For each token, calculate its hash and add/subtract from vector
    for (const token of tokens) {
      const tokenHash = this.hashToken(token, bitLength);
      
      for (let i = 0; i < bitLength; i++) {
        // If bit i is set in the hash, add 1 to vector[i], else subtract 1
        if (this.getBit(tokenHash, i)) {
          vector[i] += 1;
        } else {
          vector[i] -= 1;
        }
      }
    }
    
    // Convert the vector to a SimHash
    let simhashValue = '';
    for (let i = 0; i < bitLength; i += 4) {
      let hexDigit = 0;
      for (let j = 0; j < 4; j++) {
        if (vector[i + j] > 0) {
          hexDigit |= (1 << j);
        }
      }
      simhashValue += hexDigit.toString(16);
    }
    
    return simhashValue;
  },
  
  /**
   * Hash a token to a bit sequence
   * @param {string} token - Token to hash
   * @param {number} bitLength - Length of the hash in bits
   * @returns {string} Hash value as a binary string
   */
  hashToken(token, bitLength) {
    // Use SHA-256 for hashing
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Convert to binary and pad to ensure we have enough bits
    let binaryHash = '';
    for (let i = 0; i < hash.length; i++) {
      const decimal = parseInt(hash[i], 16);
      binaryHash += decimal.toString(2).padStart(4, '0');
    }
    
    // Trim or pad to the requested bit length
    return binaryHash.substring(0, bitLength).padEnd(bitLength, '0');
  },
  
  /**
   * Get the bit at a specific position in a binary string
   * @param {string} binaryString - Binary string
   * @param {number} position - Bit position
   * @returns {boolean} True if bit is 1, false if 0
   */
  getBit(binaryString, position) {
    return binaryString[position] === '1';
  },
  
  /**
   * Calculate Hamming distance between two SimHash values
   * @param {string} hash1 - First SimHash value (hexadecimal)
   * @param {string} hash2 - Second SimHash value (hexadecimal)
   * @returns {number} Hamming distance
   */
  hammingDistance(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) {
      return -1; // Invalid comparison
    }
    
    let distance = 0;
    
    // Convert hexadecimal to binary for bit-by-bit comparison
    for (let i = 0; i < hash1.length; i++) {
      const bin1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0');
      const bin2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0');
      
      for (let j = 0; j < 4; j++) {
        if (bin1[j] !== bin2[j]) {
          distance++;
        }
      }
    }
    
    return distance;
  },
  
  /**
   * Calculate similarity between two SimHash values (0 to 1)
   * @param {string} hash1 - First SimHash value
   * @param {string} hash2 - Second SimHash value
   * @returns {number} Similarity score (0-1)
   */
  similarity(hash1, hash2) {
    const bitLength = hash1.length * 4; // Each hex digit is 4 bits
    const distance = this.hammingDistance(hash1, hash2);
    
    if (distance === -1) {
      return 0; // Invalid comparison
    }
    
    return 1 - (distance / bitLength);
  }
};

module.exports = simhash;

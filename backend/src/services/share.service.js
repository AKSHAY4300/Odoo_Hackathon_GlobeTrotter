const crypto = require('crypto');

function generateShareId(prefix = 'pass') {
  const randomHex = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${randomHex}`;
}

module.exports = { generateShareId };

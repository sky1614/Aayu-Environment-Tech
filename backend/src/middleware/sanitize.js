const sanitizeHtml = require('sanitize-html');

function cleanValue(value) {
  if (typeof value === 'string') {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
  }
  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }
  if (value && typeof value === 'object') {
    return cleanObject(value);
  }
  return value;
}

function cleanObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = cleanValue(value);
  }
  return result;
}

function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }
  next();
}

module.exports = sanitize;

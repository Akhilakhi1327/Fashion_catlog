const sanitizeInput = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags completely
      .replace(/on\w+="[^"]*"/gi, '') // Strip inline event handlers with double quotes
      .replace(/on\w+='[^']*'/gi, '') // Strip inline event handlers with single quotes
      .replace(/on\w+=\w+/gi, '') // Strip unquoted inline event handlers
      .replace(/javascript:[^\s"']*/gi, '') // Strip javascript: URIs
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeInput);
  }
  if (typeof val === 'object' && val !== null) {
    const clean = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        clean[key] = sanitizeInput(val[key]);
      }
    }
    return clean;
  }
  return val;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

module.exports = xssSanitizer;

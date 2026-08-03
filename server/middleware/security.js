import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        return acc;
      }

      const safeKey = String(key).replace(/\$|\./g, '');
      acc[safeKey] = sanitizeValue(val);
      return acc;
    }, {});
  }

  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  return value;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    const sanitizedQuery = sanitizeValue(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  if (req.params) {
    const sanitizedParams = sanitizeValue(req.params);
    Object.keys(req.params).forEach((key) => delete req.params[key]);
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

export const attachSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

export const csrfProtection = (req, res, next) => {
  const csrfCookie = req.cookies?.csrfToken;
  const csrfToken = csrfCookie || crypto.randomBytes(32).toString('hex');

  if (!csrfCookie) {
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });
  }

  req.csrfToken = csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const exemptPaths = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/is-auth',
    '/api/auth/verify-email',
    '/api/billing/webhook',
  ];

  if (exemptPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  const headerToken = req.get('x-csrf-token') || req.get('X-CSRF-Token');

  if (headerToken && headerToken === req.csrfToken) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'CSRF token missing or invalid',
  });
};

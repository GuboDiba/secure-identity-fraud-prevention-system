const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const API = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    REFRESH: `${BASE}/auth/refresh`,
    PROTECTED: `${BASE}/auth/protected`,
  },
  FRAUD: {
    LOG_ACTIVITY: `${BASE}/fraud/log_activity`,
    LOGS: `${BASE}/fraud/logs`,
    ACTIVITY: `${BASE}/fraud/activity`,
  },
  ANALYTICS: {
    TOP_RISK_USERS: `${BASE}/analytics/top-risk-users`,
    DAILY_BLOCKS: `${BASE}/analytics/daily-blocks`,
  },
  TOTP: {
    REGISTER: `${BASE}/totp/register`,
    QR: (username: string) => `${BASE}/totp/qr/${encodeURIComponent(username)}`,
    VERIFY: `${BASE}/totp/verify`,
    USERS: `${BASE}/totp/users`,
  },
  CRYPTO: {
    LUHN: {
      GENERATE: `${BASE}/luhn/generate`,
      VALIDATE: `${BASE}/luhn/validate`,
    },
    VERHOEFF: {
      GENERATE: `${BASE}/verhoeff/generate`,
      VALIDATE: `${BASE}/verhoeff/validate`,
    },
    HASH: `${BASE}/hash/sha256`,
    HMAC: {
      GENERATE: `${BASE}/hmac/generate`,
      VERIFY: `${BASE}/hmac/verify`,
    },
    AES: {
      ENCRYPT: `${BASE}/aes/encrypt`,
      DECRYPT: `${BASE}/aes/decrypt`,
    },
    RSA: {
      GENERATE_KEYS: `${BASE}/rsa/generate-keys`,
      SIGN: `${BASE}/rsa/sign`,
      VERIFY: `${BASE}/rsa/verify`,
    },
  },
};

export default API;

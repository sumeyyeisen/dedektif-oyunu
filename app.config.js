import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    GEMINI_PROXY_URL: process.env.GEMINI_PROXY_URL || '',
  },
});


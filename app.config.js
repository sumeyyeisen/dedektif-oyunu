import 'dotenv/config';
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  },
});
/**
 * Environment variable validation — runs once on first import.
 * Logs clearly which vars are missing without crashing the app.
 */

interface EnvVar {
  key: string;
  required: boolean;
  label: string;
}

const ENV_VARS: EnvVar[] = [
  // Database
  { key: 'DATABASE_URL', required: true, label: 'Database connection string' },

  // Auth (JWT)
  { key: 'JWT_SECRET', required: true, label: 'JWT signing secret' },
  { key: 'JWT_REFRESH_SECRET', required: true, label: 'JWT refresh token secret' },

  // AI — Free tier
  { key: 'GROQ_API_KEY', required: true, label: 'Groq API key (free — groq.com)' },
  { key: 'GOOGLE_AI_API_KEY', required: false, label: 'Google AI API key (free fallback — aistudio.google.com)' },

  // Payments
  { key: 'RAZORPAY_KEY_ID', required: false, label: 'Razorpay key ID' },
  { key: 'RAZORPAY_KEY_SECRET', required: false, label: 'Razorpay key secret' },

  // App
  { key: 'NEXT_PUBLIC_APP_URL', required: false, label: 'Public app URL' },
];

let validated = false;

export function validateEnv(): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    if (!process.env[v.key]) {
      if (v.required) {
        missing.push(`  ✗ ${v.key} — ${v.label}`);
      } else {
        warnings.push(`  ⚠ ${v.key} — ${v.label} (optional, some features may be limited)`);
      }
    }
  }

  if (!validated) {
    validated = true;

    if (missing.length > 0) {
      console.error('\n[ENV] Missing REQUIRED environment variables:');
      missing.forEach(m => console.error(m));
    }

    if (warnings.length > 0) {
      console.warn('\n[ENV] Missing optional environment variables:');
      warnings.forEach(w => console.warn(w));
    }

    if (missing.length === 0 && warnings.length === 0) {
      console.log('[ENV] All environment variables configured.');
    }
  }

  return { missing, warnings };
}

// Run validation on import (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}

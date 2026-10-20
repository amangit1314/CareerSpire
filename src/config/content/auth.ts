/**
 * Static UI copy for the auth pages. Centralized here rather than inline
 * in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/app/auth/login/page.tsx */
export const LOGIN_CONTENT = {
  TITLE: "Login",
  DESCRIPTION: "Enter your credentials to access your account",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "you@example.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "••••••••",
  SHOW_PASSWORD_LABEL: "Show password",
  HIDE_PASSWORD_LABEL: "Hide password",
  FORGOT_PASSWORD_LINK: "Forgot Password?",
  SUBMIT: "Sign In",
  SUBMIT_PENDING: "Signing in...",
  NO_ACCOUNT_PROMPT: "Don't have an account? ",
  SIGNUP_LINK: "Sign up",
} as const;

/** src/app/auth/signup/page.tsx */
export const SIGNUP_CONTENT = {
  TITLE: "Create an account",
  DESCRIPTION: "Enter your email below to create your account",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "you@example.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "••••••••",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  SHOW_PASSWORD_LABEL: "Show password",
  HIDE_PASSWORD_LABEL: "Hide password",
  SUBMIT: "Sign Up",
  SUBMIT_PENDING: "Creating account...",
  HAS_ACCOUNT_PROMPT: "Already have an account? ",
  LOGIN_LINK: "Sign in",
} as const;

/** src/app/auth/forgot-password/page.tsx */
export const FORGOT_PASSWORD_CONTENT = {
  SECTION_LABEL: "Authentication",
  TITLE: "Reset Password",
  DESCRIPTION:
    "Enter your email and we'll send you a link to reset your password.",
  EMAIL_LABEL: "Email Address",
  EMAIL_PLACEHOLDER: "name@example.com",
  SUBMIT: "Send Reset Link",
  SUBMIT_PENDING: "Sending Link...",
  REMEMBER_PASSWORD_PROMPT: "Remember your password?",
  LOGIN_LINK: "Login",
  SUBMITTED_TITLE: "Check your email",
  SUBMITTED_DESCRIPTION_PREFIX: "We've sent a password reset link to",
  SUBMITTED_HINT:
    "If you don't see the email, please check your spam folder. The link will expire in 1 hour.",
  BACK_TO_LOGIN: "Back to Login",
  TRY_ANOTHER_EMAIL: "Try another email address",
} as const;

/** src/app/auth/reset-password/page.tsx */
export const RESET_PASSWORD_CONTENT = {
  SECTION_LABEL: "Authentication",
  LOADING: "Loading...",
  TITLE: "New Password",
  DESCRIPTION: "Please enter your new password below.",
  PASSWORD_LABEL: "New Password",
  PASSWORD_PLACEHOLDER: "••••••••",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  SHOW_PASSWORD_LABEL: "Show password",
  HIDE_PASSWORD_LABEL: "Hide password",
  SUBMIT: "Reset Password",
  SUBMIT_PENDING: "Updating Password...",
  SUCCESS_TITLE: "Password Updated",
  SUCCESS_DESCRIPTION:
    "Your password has been reset successfully. You will be redirected to the login page shortly.",
  SUCCESS_LOGIN_LINK: "Login Now",
  INVALID_LINK_TITLE: "Invalid Link",
  INVALID_LINK_DESCRIPTION:
    "The password reset link is invalid or has expired.",
  INVALID_LINK_ACTION: "Request New Link",
} as const;

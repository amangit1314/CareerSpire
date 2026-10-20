/**
 * Static UI copy for the mock interview (text + video) flows. Centralized
 * here rather than inline in JSX — mirrors `routes.ts`/`messages.ts`.
 */

/** src/components/FeedbackPanel.tsx */
export const FEEDBACK_PANEL_CONTENT = {
  SCORE_EXCELLENT: "Excellent work!",
  SCORE_GOOD: "Good effort",
  SCORE_NEEDS_WORK: "Keep practicing",
  TESTS_LABEL: "Tests",
  QUALITY_LABEL: "Quality",
  COMPLEXITY_LABEL: "Complexity",
  AI_INSIGHTS: "AI Insights",
  CORRECT_SOLUTION: "Correct solution",
  SEE_CORRECTED_CODE: "See corrected code below",
  SEE_MODEL_ANSWER: "See model answer below",
  YOUR_CODE_ANNOTATED: "Your Code (Annotated)",
  CORRECTED_CODE: "Corrected Code",
  MODEL_ANSWER: "Model Answer",
  STEP_BY_STEP_BREAKDOWN: "Step-by-Step Breakdown",
  TEST_RESULTS: (passed: number, total: number) =>
    `Test Results (${passed}/${total} passed)`,
  TEST_LABEL: (index: number) => `Test ${index}`,
  INPUT_LABEL: "Input:",
  EXPECTED_LABEL: "Expected:",
  GOT_LABEL: "Got:",
  STRENGTHS: "Strengths",
  TO_IMPROVE: "To Improve",
  RECOMMENDED_NEXT: "Recommended Next",
  NULL_VALUE: "null",
} as const;

/** src/components/VideoPreflightCheck.tsx */
export const VIDEO_PREFLIGHT_CHECK_CONTENT = {
  TITLE: "Pre-Interview Check",
  DESCRIPTION:
    "Let's make sure your camera and microphone are working properly",
  CAMERA_REQUESTING: "Requesting camera access...",
  CAMERA_DENIED: "Camera access denied",
  CAMERA_UNAVAILABLE: "Camera not available",
  MIC_LEVEL: "Microphone Level",
  CAMERA_LABEL: "Camera",
  MICROPHONE_LABEL: "Microphone",
  READY: "Ready",
  CHECKING: "Checking...",
  NOT_AVAILABLE: "Not available",
  CANCEL: "Cancel",
  START_INTERVIEW: "Start Interview",
  WAITING_FOR_PERMISSIONS: "Waiting for permissions...",
  PERMISSION_REQUIRED: "Permission Required",
  PERMISSION_HELP:
    "Please allow camera and microphone access in your browser settings, then refresh this page.",
} as const;

/** src/components/VideoRecorder.tsx */
export const VIDEO_RECORDER_CONTENT = {
  STREAM_ERROR: "Failed to access camera and microphone",
  NO_SUPPORTED_FORMAT: "No supported video format found in this browser",
  RETRY: "Retry",
  PAUSED: "PAUSED",
  REC: "REC",
  START_RECORDING: "Start Recording",
  RESUME: "Resume",
  PAUSE: "Pause",
  STOP: "Stop",
  MIN_DURATION_PREFIX: "Min",
  RE_RECORD: "Re-record",
  SUBMIT_RECORDING: "Submit Recording",
} as const;

/** src/components/AIInterviewer.tsx */
export const AI_INTERVIEWER_CONTENT = {
  MUTE: "Mute",
  UNMUTE: "Unmute",
  REPLAY_QUESTION: "Replay Question",
} as const;

/** src/app/(product)/mock/video/[id]/_components/LoadingScreen.tsx */
export const VIDEO_MOCK_LOADING_CONTENT = {
  MESSAGE: "Preparing your interview...",
} as const;

/** src/app/(product)/mock/video/[id]/_components/SessionNotFoundScreen.tsx */
export const VIDEO_MOCK_NOT_FOUND_CONTENT = {
  TITLE: "Session Not Found",
  DESCRIPTION:
    "The interview session you requested could not be found or has no questions.",
  GO_BACK: "Go Back",
} as const;

/** src/app/(product)/mock/[id]/_components/TimeUpOverlay.tsx */
export const TIME_UP_OVERLAY_CONTENT = {
  TITLE: "Time's Up!",
  DESCRIPTION_PREFIX: "Your session time has ended. You have a",
  GRACE_PERIOD: "2-minute grace period",
  DESCRIPTION_SUFFIX: "to finish your current answer and submit.",
  END_NOW: "End Now",
  USE_GRACE_PERIOD: "Use Grace Period",
} as const;

/** src/app/(product)/mock/[id]/_components/HintsPanel.tsx */
export const HINTS_PANEL_CONTENT = {
  LOCKED: "Locked — reveal previous hints first",
  REVEAL_PROMPT: (label: string, n: number) =>
    `Click to reveal ${label.toLowerCase()} ${n}`,
  TRY_YOURSELF_FIRST: "Try solving it yourself first",
  PROGRESS: (revealed: number, total: number) =>
    `${revealed}/${total} revealed — try to solve with fewer hints for better practice`,
  ALL_REVEALED: (label: string) => `All ${label.toLowerCase()} revealed`,
} as const;

/** src/app/(product)/mock/[id]/_components/SessionHeader.tsx */
export const SESSION_HEADER_CONTENT = {
  QUESTION_NAV_LABEL: (n: number) => `Q. ${n}`,
  EXIT_SESSION: "Exit Session",
} as const;

/** src/app/(product)/mock/video/[id]/_components/CompleteScreen.tsx */
export const COMPLETE_SCREEN_CONTENT = {
  TITLE: "Interview Complete!",
  SUMMARY: (questionCount: number, elapsedTimeLabel: string) =>
    `Great job! You answered ${questionCount} questions in ${elapsedTimeLabel}.`,
  PERFORMANCE_SUMMARY: "Performance Summary",
  QUESTION_LABEL: (n: number) => `Q${n}`,
  EVALUATING: "Evaluating your last answer...",
  SHARE_PROMPT: "Share with Community?",
  VISIBILITY_PUBLIC: "Public - Others can view",
  VISIBILITY_PRIVATE: "Private - Only you",
  VISIBILITY_HINT:
    "Making your interview public helps others learn from your experience",
  VIEW_COMMUNITY: "View Community",
  SAVING: "Saving...",
  FINISH_AND_SAVE: "Finish & Save",
} as const;

/** src/app/(product)/mock/[id]/_components/QuestionDescriptionPanel.tsx */
export const QUESTION_DESCRIPTION_PANEL_CONTENT = {
  BADGE_PREDICT_OUTPUT: "Predict Output",
  BADGE_FIND_BUG: "Find the Bug",
  BADGE_THEORY: "Theory",
  BADGE_IMPLEMENTATION: "Implementation",
  BADGE_DSA: "DSA",
  OUTPUT_PREDICTION_INSTRUCTION:
    "Carefully read the code below. What will be printed to the console when executed? Explain your reasoning.",
  DEBUGGING_INSTRUCTION:
    "The code below has a bug. Identify the issue and submit your corrected version in the editor.",
  CODE_WRITING_INSTRUCTION:
    "Implement the solution in the code editor. Focus on clean, working code that meets the requirements described above.",
  REFERENCE_SNIPPET_LABEL: "Reference Code Snippet",
} as const;

/** src/app/(product)/mock/new/page.tsx */
export const NEW_MOCK_CONTENT = {
  STATUS_STARTING: "Starting...",
  STATUS_INITIALIZING: "Initializing session...",
  STATUS_GENERATING: "Generating AI questions (Parallel Processing)...",
  STATUS_SLOW_NOTICE: "This might take 60-90 seconds for high quality...",
  STATUS_AGGREGATING: "Aggregating and validating questions...",
  TITLE: "Start Mock Interview",
  SUBTITLE: "Choose your interview type and difficulty level",
  CARD_TITLE: "Interview Type",
  CARD_DESCRIPTION: "Select the type of interview you want to practice",
  STARTUP_ERROR_TITLE: "Startup Error",
  TYPE_DSA_LABEL: "DSA",
  TYPE_DSA_DESCRIPTION: "Data Structures & Algorithms",
  TYPE_CODING_LABEL: "Coding",
  TYPE_CODING_DESCRIPTION: "Language Fundamentals",
  TYPE_HR_LABEL: "HR",
  TYPE_HR_DESCRIPTION: "Behavioral Questions",
  TYPE_VIDEO_LABEL: "Video",
  TYPE_VIDEO_DESCRIPTION: "Live AI Interview",
  TYPE_VIDEO_BADGE: "beta",
  DIFFICULTY_LABEL: "Difficulty Level",
  LANGUAGE_LABEL: "Language",
  FRAMEWORK_LABEL: "Framework (optional)",
  TRY_AGAIN: "Try Again",
  START_INTERVIEW: "Start Mock Interview",
  GENERATING_HINT:
    "Our AI is crafting your personalized interview. Please stay on this page.",
} as const;

/** src/app/(product)/mock/video/page.tsx */
export const VIDEO_MOCK_SETUP_CONTENT = {
  EYEBROW: "AI Video Interview",
  TITLE: "Configure Your Interview",
  STEP_CHOOSE_TYPE: "Choose your interview type",
  STEP_TECH_STACK: "Select your tech stack",
  STEP_CATEGORY: "Select category",
  STEP_FOCUS_AREA: "Choose focus area",
  STEP_DIFFICULTY: "Set difficulty and start",
  INTERVIEW_TYPE_HEADING: "Interview Type",
  LANGUAGE_HEADING: "Language",
  FRAMEWORK_HEADING: "Framework",
  OPTIONAL: "(optional)",
  NONE: "None",
  CATEGORY_HEADING: "Category",
  FOCUS_AREA_HEADING: "Focus Area",
  DIFFICULTY_HEADING: "Difficulty",
  SUMMARY_TITLE: "Interview Summary",
  SUMMARY_TYPE: "Type",
  SUMMARY_STACK: "Stack",
  SUMMARY_DIFFICULTY: "Difficulty",
  SUMMARY_QUESTIONS: "Questions",
  BACK: "Back",
  STARTING: "Starting...",
  START_INTERVIEW: "Start Interview",
  NEXT: "Next",
} as const;

/** src/app/(product)/mock/video/[id]/page.tsx */
export const VIDEO_MOCK_SESSION_CONTENT = {
  BRIDGING_QUESTION: "Got it. Let's move to the next question.",
  QUESTION_PROGRESS: (n: number, total: number) => `Question ${n} of ${total}`,
  VOICE_MODE_ON: "Voice Mode: ON",
  VOICE_MODE_OFF: "Voice Mode: OFF",
  CATEGORY_LABEL: "Category",
  EXPECTED_TIME_LABEL: "Expected time",
  EXPECTED_TIME_UNIT: "min",
  TIP_PREFIX: "Tip:",
  PROCESSING_ANSWER: "Processing answer...",
  LISTEN_TO_QUESTION: "Listen to the question...",
  LIVE_TRANSCRIPT: "Live Transcript",
  WAITING_FOR_ANSWER: "Waiting for your answer...",
  VOICE_MODE_HINT:
    "Speak naturally. After 1 min, the AI will auto-advance when you pause.",
  MANUAL_MODE_HINT: "Answer for at least 1 minute, then click Stop to submit.",
  SUBMIT_ANSWER: "Submit Answer",
} as const;

/** src/app/(product)/mock/[id]/page.tsx */
export const MOCK_INTERVIEW_CONTENT = {
  SESSION_NOT_FOUND_TITLE: "Session not found",
  NO_QUESTIONS_TITLE: "No questions found",
  SESSION_NOT_FOUND_MESSAGE:
    "The interview session you're looking for doesn't exist or has been deleted.",
  NO_QUESTIONS_MESSAGE:
    "This session doesn't have any questions associated with it. Please try starting a new interview.",
  START_NEW_MOCK: "Start New Mock",
  QUESTION_NOT_FOUND:
    "The requested question could not be found in this session.",
  SWITCH_QUESTION_CONFIRM:
    "⚠️ Switching questions will reset your current progress.\n\nYour code for this question will be lost. Are you sure you want to continue?",
  TAB_DESCRIPTION: "Description",
  TAB_FEEDBACK: "Feedback",
  GO_TO_NEXT_QUESTION: "Go to Next Question",
  FINISH_SESSION: "Finish Session and Return to Dashboard",
  MODE_PLACEHOLDER: "Mode",
  LANGUAGE_PLACEHOLDER: "Language",
  CODE_EDITOR_OPTION: "Code Editor",
  TEXT_EDITOR_OPTION: "Text Editor",
  ANSWER_PLACEHOLDER_OUTPUT_PREDICTION:
    "What will this code output? Explain your reasoning...",
  ANSWER_PLACEHOLDER_THEORY: "Explain your understanding with examples...",
  ANSWER_PLACEHOLDER_DEFAULT:
    "Type your answer, explanation, or system design notes here...",
  SUBMITTING: "Submitting...",
  SUBMIT_ANSWER: "Submit Answer",
  EDITOR_COLLAPSED_LABEL: "Editor",
} as const;

import { Lightbulb, Code, HelpCircle, RotateCw } from "lucide-react";

export enum QuickActionAvailability {
  Always = "always",
  AfterUserMessage = "after-user-message",
  AfterAiExplanation = "after-ai-explanation",
}

export type QuickAction = {
  label: string;
  prompt: string;
  icon: typeof Lightbulb;
  /** When this chip should be visible. */
  availability: QuickActionAvailability;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Give me a hint",
    prompt:
      "I could use a small hint — just enough to unblock me, without giving away the solution.",
    icon: Lightbulb,
    availability: QuickActionAvailability.Always,
  },
  {
    label: "Show an example",
    prompt:
      "Could you show me a small code example that illustrates this concept?",
    icon: Code,
    availability: QuickActionAvailability.Always,
  },
  {
    label: "Test my understanding",
    prompt:
      "Can you ask me one focused question to check my understanding of this concept?",
    icon: HelpCircle,
    availability: QuickActionAvailability.AfterUserMessage,
  },
  {
    label: "Explain differently",
    prompt:
      "Can you re-explain your last point in a different way, ideally with an analogy?",
    icon: RotateCw,
    availability: QuickActionAvailability.AfterAiExplanation,
  },
];

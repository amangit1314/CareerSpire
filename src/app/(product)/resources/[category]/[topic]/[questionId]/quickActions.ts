import { Lightbulb, Code, HelpCircle, RotateCw } from 'lucide-react';

export type QuickAction = {
    label: string;
    prompt: string;
    icon: typeof Lightbulb;
    /** When this chip should be visible. */
    availability: 'always' | 'after-user-message' | 'after-ai-explanation';
};

export const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Give me a hint',
        prompt: 'I could use a small hint — just enough to unblock me, without giving away the solution.',
        icon: Lightbulb,
        availability: 'always',
    },
    {
        label: 'Show an example',
        prompt: 'Could you show me a small code example that illustrates this concept?',
        icon: Code,
        availability: 'always',
    },
    {
        label: 'Test my understanding',
        prompt: 'Can you ask me one focused question to check my understanding of this concept?',
        icon: HelpCircle,
        availability: 'after-user-message',
    },
    {
        label: 'Explain differently',
        prompt: 'Can you re-explain your last point in a different way, ideally with an analogy?',
        icon: RotateCw,
        availability: 'after-ai-explanation',
    },
];

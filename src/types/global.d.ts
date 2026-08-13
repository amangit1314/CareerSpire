export { };

declare global {
    // Minimal Web Speech API types — this TS/DOM lib version ships
    // SpeechRecognitionResult but not SpeechRecognition or
    // SpeechRecognitionEvent themselves (still experimental/vendor-prefixed).
    // Covers only what src/app/mock/video/[id]/page.tsx actually uses.
    interface SpeechRecognitionEvent extends Event {
        resultIndex: number;
        results: SpeechRecognitionResultList;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        onend: (() => void) | null;
        start(): void;
        stop(): void;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };

    // Minimal shape for the swagger-ui-dist UMD bundle, loaded at runtime
    // from a CDN script tag (src/app/docs/page.tsx) rather than imported as
    // a module — no @types package covers that usage, so this covers just
    // what's called.
    interface SwaggerUIBundleOptions {
        url: string;
        dom_id: string;
        presets: unknown[];
        layout: string;
        deepLinking?: boolean;
        defaultModelsExpandDepth?: number;
        defaultModelExpandDepth?: number;
    }

    interface SwaggerUIBundleFn {
        (options: SwaggerUIBundleOptions): void;
        presets: { apis: unknown };
    }

    // Minimal shape for the Razorpay Checkout widget, loaded via
    // <Script src="https://checkout.razorpay.com/v1/checkout.js" /> in the
    // pricing and billing pages — covers only what those pages actually
    // call. Was independently `declare global { interface Window { Razorpay:
    // any } }` in both files; centralized here like the other CDN-script
    // globals above.
    interface RazorpayCheckoutOptions {
        key: string | undefined;
        amount: number;
        currency: string;
        name: string;
        description: string;
        order_id: string;
        handler: () => void;
        prefill?: { name: string; email: string };
        theme?: { color: string };
    }

    interface RazorpayPaymentFailedResponse {
        error: { description: string;[key: string]: unknown };
    }

    interface RazorpayCheckoutInstance {
        open(): void;
        on(event: 'payment.failed', handler: (response: RazorpayPaymentFailedResponse) => void): void;
    }

    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
        SwaggerUIBundle?: SwaggerUIBundleFn;
        Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
    }
}

import { useEffect, useRef } from "react";

/**
 * Keeps a ref pointed at the latest value of something that changes across
 * renders — typically a prop or a callback identity — so effects/callbacks
 * that shouldn't re-run on every change can still read the current value.
 *
 * Synced via useEffect, not written directly in the render body: mutating a
 * ref during render is unsafe under concurrent rendering (a render can be
 * discarded without committing, leaving the ref out of sync with what
 * actually rendered).
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

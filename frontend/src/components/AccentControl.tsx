import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { slidersIcon } from "./icons";

type Picker = typeof import("./AccentPicker").default;

/** Keep color conversion and picker code out of visits that never use it. */
export default function AccentControl() {
  const [Picker, setPicker] = useState<Picker | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [focusFrom, setFocusFrom] = useState<HTMLElement | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef(0);

  const cancel = useCallback(() => {
    requestRef.current += 1;
    setPending(false);
    setMessage("");
  }, []);

  useEffect(() => {
    return () => {
      requestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!pending) return;

    const cancelOutside = (event: Event) => {
      if (!controlRef.current?.contains(event.target as Node)) cancel();
    };
    const cancelEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      }
    };

    document.addEventListener("pointerdown", cancelOutside);
    document.addEventListener("focusin", cancelOutside);
    document.addEventListener("keydown", cancelEscape);
    return () => {
      document.removeEventListener("pointerdown", cancelOutside);
      document.removeEventListener("focusin", cancelOutside);
      document.removeEventListener("keydown", cancelEscape);
    };
  }, [cancel, pending]);

  const open = () => {
    if (pending) {
      cancel();
      return;
    }

    const request = ++requestRef.current;
    setPending(true);
    setMessage("Loading accent color picker.");
    void import("./AccentPicker")
      .then(({ default: LoadedPicker }) => {
        if (request !== requestRef.current) return;
        setFocusFrom(
          document.activeElement === triggerRef.current
            ? triggerRef.current
            : null,
        );
        setPicker(() => LoadedPicker);
        setPending(false);
      })
      .catch(() => {
        if (request !== requestRef.current) return;
        setPending(false);
        setMessage("Unable to load the accent color picker. Please try again.");
      });
  };

  return (
    <div className="accent-control" ref={controlRef}>
      {Picker ? (
        <Picker initiallyOpen focusFrom={focusFrom} />
      ) : (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={open}
            className="accent-toggle"
            aria-expanded={false}
            aria-haspopup="dialog"
            aria-busy={pending || undefined}
            aria-label="Customize accent color"
          >
            <span
              className="accent-swatch"
              style={{ backgroundColor: "var(--accent)" }}
              aria-hidden="true"
            />
            <Icon icon={slidersIcon} />
          </button>
          <p className="sr-only" aria-live="polite" role="status">
            {message}
          </p>
        </>
      )}
    </div>
  );
}

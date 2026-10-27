import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { slidersIcon } from "./icons";

type Picker = typeof import("./AccentPicker").default;
type PickerModule = typeof import("./AccentPicker");

let pickerPromise: Promise<PickerModule> | null = null;

function loadPicker() {
  pickerPromise ??= import("./AccentPicker").catch((error: unknown) => {
    pickerPromise = null;
    throw error;
  });
  return pickerPromise;
}

function preloadPicker() {
  // Speculative failures stay quiet; opening the picker can retry and report one.
  void loadPicker().catch(() => {});
}

/** Warm the picker after page load without adding it to the initial bundle. */
export default function AccentControl() {
  const [Picker, setPicker] = useState<Picker | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [focusFrom, setFocusFrom] = useState<HTMLElement | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef(0);

  const cancel = () => {
    requestRef.current += 1;
    setPending(false);
    setMessage("");
  };

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const schedulePreload = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(preloadPicker, { timeout: 1000 });
      } else {
        timeoutId = window.setTimeout(preloadPicker, 200);
      }
    };

    if (document.readyState === "complete") {
      schedulePreload();
    } else {
      window.addEventListener("load", schedulePreload, { once: true });
    }

    return () => {
      requestRef.current += 1;
      window.removeEventListener("load", schedulePreload);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
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
    void loadPicker()
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
            onPointerEnter={preloadPicker}
            onFocus={preloadPicker}
            onPointerDown={preloadPicker}
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

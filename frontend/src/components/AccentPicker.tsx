import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "culori/css";
import { converter, formatHex, parse } from "culori/fn";
import { HexColorPicker } from "react-colorful";
import { Button } from "react-aria-components";
import {
  safeGetStorage,
  safeRemoveStorage,
  safeSetStorage,
  StorageKey,
} from "@/utils/storage";

const DEFAULT_L: string = "0.475";
const DEFAULT_C: string = "0.25";
const DEFAULT_H: string = "300";
const DEFAULT_ACCENT: string = `oklch(${DEFAULT_L} ${DEFAULT_C} ${DEFAULT_H})`;
const LIGHTNESS_MIN = 0;
const LIGHTNESS_MAX = 1;
const CHROMA_MIN = 0;
const HUE_MIN = 0;
const HUE_MAX = 360;

type OklchColor = {
  mode: "oklch";
  l: number;
  c: number;
  h?: number;
};

type DraftChannels = {
  l: string;
  c: string;
  h: string;
};

type ChannelErrors = {
  l: boolean;
  c: boolean;
  h: boolean;
};

const toOklch = converter("oklch");

// Rounds a number to the specified decimals and converts to string, removing trailing zeros
function round(value: number, decimals: number): string {
  // convert back to number to avoid trailing zeros
  return Number(value.toFixed(decimals)).toString();
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

function formatOklch(color: OklchColor): string {
  const l = Math.min(1, Math.max(0, color.l));
  const c = Math.max(0, color.c);
  const rawHue =
    typeof color.h === "number" && Number.isFinite(color.h) ? color.h : 0;
  const h = normalizeHue(rawHue);
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`;
}

function toValidOklch(input: string): OklchColor | null {
  const parsed = parse(input);
  if (!parsed) return null;

  const converted = toOklch(parsed);
  if (
    !converted ||
    !Number.isFinite(converted.l) ||
    !Number.isFinite(converted.c)
  ) {
    return null;
  }

  return {
    mode: "oklch",
    l: converted.l,
    c: converted.c,
    h:
      typeof converted.h === "number" && Number.isFinite(converted.h)
        ? converted.h
        : 0,
  };
}

function normalizeAccent(input: string): string | null {
  const parsed = toValidOklch(input);
  return parsed ? formatOklch(parsed) : null;
}

function resolveAccent(stored: string | null): string {
  if (!stored) return DEFAULT_ACCENT;
  const normalized = normalizeAccent(stored);
  return normalized ?? DEFAULT_ACCENT;
}

function parseChannel(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Converts to valid Oklch channels for display in the inputs
function toDraftChannels(accent: string): DraftChannels {
  const parsed = toValidOklch(accent) ?? toValidOklch(DEFAULT_ACCENT);
  if (!parsed) {
    return { l: DEFAULT_L, c: DEFAULT_C, h: DEFAULT_H };
  }

  return {
    l: round(Math.min(LIGHTNESS_MAX, Math.max(LIGHTNESS_MIN, parsed.l)), 4),
    c: round(Math.max(CHROMA_MIN, parsed.c), 4),
    h: round(normalizeHue(parsed.h ?? 0), 2),
  };
}

function validateChannels(channels: DraftChannels): {
  errors: ChannelErrors;
  accent: string | null;
} {
  const l = parseChannel(channels.l);
  const c = parseChannel(channels.c);
  const h = parseChannel(channels.h);

  const errors: ChannelErrors = {
    l: l === null || l < LIGHTNESS_MIN || l > LIGHTNESS_MAX,
    c: c === null || c < CHROMA_MIN,
    h: h === null || h < HUE_MIN || h > HUE_MAX,
  };

  if (
    errors.l ||
    errors.c ||
    errors.h ||
    l === null ||
    c === null ||
    h === null
  ) {
    return { errors, accent: null };
  }

  return {
    errors,
    accent: formatOklch({ mode: "oklch", l, c, h }),
  };
}

function getChannelErrorMessages(channels: DraftChannels): string[] {
  const l = parseChannel(channels.l);
  const c = parseChannel(channels.c);
  const h = parseChannel(channels.h);
  const messages: string[] = [];

  if (l === null) {
    messages.push("Lightness is required.");
  } else if (l < LIGHTNESS_MIN || l > LIGHTNESS_MAX) {
    messages.push(
      `Lightness must be between ${LIGHTNESS_MIN} and ${LIGHTNESS_MAX}.`,
    );
  }

  if (c === null) {
    messages.push("Chroma is required.");
  } else if (c < CHROMA_MIN) {
    messages.push(`Chroma must be ${CHROMA_MIN} or greater.`);
  }

  if (h === null) {
    messages.push("Hue is required.");
  } else if (h < HUE_MIN || h > HUE_MAX) {
    messages.push(`Hue must be between ${HUE_MIN} and ${HUE_MAX}.`);
  }

  return messages;
}

function applyAccent(accent: string) {
  document.documentElement.style.setProperty("--accent", accent);
}

export default function AccentPicker() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [draft, setDraft] = useState<DraftChannels>(
    toDraftChannels(DEFAULT_ACCENT),
  );
  const [channelErrors, setChannelErrors] = useState<ChannelErrors>({
    l: false,
    c: false,
    h: false,
  });
  const [liveMessage, setLiveMessage] = useState("");
  const controlRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resolvedAccent = resolveAccent(safeGetStorage(StorageKey.Accent));

    if (resolvedAccent === DEFAULT_ACCENT) {
      safeRemoveStorage(StorageKey.Accent);
    }

    setAccent(resolvedAccent);
    setDraft(toDraftChannels(resolvedAccent));
    applyAccent(resolvedAccent);
    setMounted(true);
  }, []);

  const closeWithoutApply = useCallback(() => {
    setDraft(toDraftChannels(accent));
    setChannelErrors({ l: false, c: false, h: false });
    applyAccent(accent);
    setIsOpen(false);
    setLiveMessage("Accent picker closed without applying changes.");
  }, [accent]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        controlRef.current &&
        !controlRef.current.contains(event.target as Node)
      ) {
        closeWithoutApply();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWithoutApply();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeWithoutApply, isOpen]);

  const pickerHex = useMemo(() => {
    const { accent: previewAccent } = validateChannels(draft);
    const parsed =
      toValidOklch(previewAccent ?? accent) ??
      toValidOklch(accent) ??
      toValidOklch(DEFAULT_ACCENT);
    return parsed ? formatHex(parsed) : "#8a00e5";
  }, [accent, draft]);

  const activeErrorMessages = useMemo(
    () => getChannelErrorMessages(draft),
    [draft],
  );

  const openPicker = useCallback(() => {
    setDraft(toDraftChannels(accent));
    setChannelErrors({ l: false, c: false, h: false });
    setLiveMessage("");
    setIsOpen(true);
  }, [accent]);

  const handleHexChange = useCallback((hex: string) => {
    const parsed = toValidOklch(hex);
    if (!parsed) return;
    const nextDraft = toDraftChannels(formatOklch(parsed));
    setDraft(nextDraft);
    setChannelErrors({ l: false, c: false, h: false });

    const { accent: previewAccent } = validateChannels(nextDraft);
    if (previewAccent) {
      applyAccent(previewAccent);
      setLiveMessage("Previewing accent color.");
    }
  }, []);

  const handleChannelChange = useCallback(
    (channel: keyof DraftChannels, value: string) => {
      setDraft((previous) => {
        const next = { ...previous, [channel]: value };
        const validation = validateChannels(next);
        setChannelErrors(validation.errors);

        if (validation.accent) {
          applyAccent(validation.accent);
          setLiveMessage("Previewing accent color.");
        }

        return next;
      });
    },
    [],
  );

  const applyDraftAccent = useCallback(() => {
    const validation = validateChannels(draft);
    setChannelErrors(validation.errors);

    if (!validation.accent) {
      const details = getChannelErrorMessages(draft).join(" ");
      setLiveMessage(
        details
          ? `Invalid accent channels. ${details}`
          : "Invalid accent channels.",
      );
      return;
    }

    setAccent(validation.accent);
    setDraft(toDraftChannels(validation.accent));
    applyAccent(validation.accent);
    safeSetStorage(StorageKey.Accent, validation.accent);
    setIsOpen(false);
    setLiveMessage("Accent color applied.");
  }, [draft]);

  const resetAccent = useCallback(() => {
    setAccent(DEFAULT_ACCENT);
    setDraft(toDraftChannels(DEFAULT_ACCENT));
    setChannelErrors({ l: false, c: false, h: false });
    applyAccent(DEFAULT_ACCENT);
    safeRemoveStorage(StorageKey.Accent);
    setLiveMessage("Accent reset to default.");
  }, []);

  if (!mounted) {
    return <div className="accent-toggle" aria-hidden="true" />;
  }

  return (
    <div className="accent-control" ref={controlRef}>
      <Button
        type="button"
        onPress={isOpen ? closeWithoutApply : openPicker}
        className="accent-toggle"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="accent-picker-panel"
        aria-label="Customize accent color"
      >
        <span
          className="accent-swatch"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <i className="fa-solid fa-sliders" aria-hidden="true" />
      </Button>

      {isOpen && (
        <div
          id="accent-picker-panel"
          className="accent-popover"
          role="dialog"
          aria-label="Accent color picker"
        >
          <HexColorPicker
            color={pickerHex}
            onChange={handleHexChange}
            className="accent-hex-picker"
          />

          <div className="accent-channel-grid">
            <label className="accent-channel" htmlFor="accent-lightness">
              <span>Lightness</span>
              <input
                id="accent-lightness"
                type="number"
                min={LIGHTNESS_MIN}
                max={LIGHTNESS_MAX}
                step="0.0001"
                className={`accent-input ${channelErrors.l ? "invalid" : ""}`}
                value={draft.l}
                onChange={(event) =>
                  handleChannelChange("l", event.target.value)
                }
                autoComplete="off"
              />
            </label>

            <label className="accent-channel" htmlFor="accent-chroma">
              <span>Chroma</span>
              <input
                id="accent-chroma"
                type="number"
                min={CHROMA_MIN}
                step="0.0001"
                className={`accent-input ${channelErrors.c ? "invalid" : ""}`}
                value={draft.c}
                onChange={(event) =>
                  handleChannelChange("c", event.target.value)
                }
                autoComplete="off"
              />
            </label>

            <label className="accent-channel" htmlFor="accent-hue">
              <span>Hue</span>
              <input
                id="accent-hue"
                type="number"
                min={HUE_MIN}
                max={HUE_MAX}
                step="0.01"
                className={`accent-input ${channelErrors.h ? "invalid" : ""}`}
                value={draft.h}
                onChange={(event) =>
                  handleChannelChange("h", event.target.value)
                }
                autoComplete="off"
              />
            </label>
          </div>

          <p
            className={`accent-input-hint ${
              channelErrors.l || channelErrors.c || channelErrors.h
                ? "error"
                : ""
            }`}
          >
            {activeErrorMessages.length > 0
              ? activeErrorMessages.join(" ")
              : ""}
          </p>

          <div className="accent-actions">
            <Button
              type="button"
              className="accent-apply"
              onPress={applyDraftAccent}
            >
              Apply
            </Button>
            <Button
              type="button"
              className="accent-reset"
              onPress={resetAccent}
            >
              Reset to default
            </Button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite" role="status">
        {liveMessage}
      </p>
    </div>
  );
}

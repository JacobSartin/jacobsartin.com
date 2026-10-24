import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  converter,
  formatHex,
  modeOklch,
  modeRgb,
  parse,
  useMode,
} from "culori/fn";
import { useForm, useSelector } from "@tanstack/react-form";
import { HexColorPicker } from "react-colorful";
import Icon from "./Icon";
import { slidersIcon } from "./icons";
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

const channels = [
  {
    name: "l",
    label: "Lightness",
    id: "accent-lightness",
    min: LIGHTNESS_MIN,
    max: LIGHTNESS_MAX,
    step: "0.0001",
  },
  {
    name: "c",
    label: "Chroma",
    id: "accent-chroma",
    min: CHROMA_MIN,
    max: undefined,
    step: "0.0001",
  },
  {
    name: "h",
    label: "Hue",
    id: "accent-hue",
    min: HUE_MIN,
    max: HUE_MAX,
    step: "0.01",
  },
] as const;

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

// Only hex/RGB and persisted/numeric OKLCH colors enter this control.
useMode(modeRgb);
useMode(modeOklch);
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

function getChannelErrors(values: DraftChannels) {
  const errors: Partial<Record<keyof DraftChannels, string>> = {};
  for (const channel of channels) {
    const value = parseChannel(values[channel.name]);
    if (value === null) errors[channel.name] = channel.label + " is required.";
    else if (
      value < channel.min ||
      (channel.max !== undefined && value > channel.max)
    ) {
      errors[channel.name] =
        channel.max === undefined
          ? channel.label + " must be " + channel.min + " or greater."
          : channel.label +
            " must be between " +
            channel.min +
            " and " +
            channel.max +
            ".";
    }
  }
  return errors;
}

function validateForm(values: DraftChannels) {
  const fields = getChannelErrors(values);
  return Object.keys(fields).length ? { fields } : undefined;
}

function applyAccent(accent: string) {
  document.documentElement.style.setProperty("--accent", accent);
}

interface Props {
  initiallyOpen?: boolean;
  focusFrom?: HTMLElement | null;
}

export default function AccentPicker({
  initiallyOpen = false,
  focusFrom = null,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [liveMessage, setLiveMessage] = useState("");
  const controlRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusHandledRef = useRef(false);
  const form = useForm({
    defaultValues: toDraftChannels(DEFAULT_ACCENT),
    validators: {
      onChange: ({ value }) => validateForm(value),
      onSubmit: ({ value }) => validateForm(value),
    },
    listeners: {
      onChange: ({ formApi }) => {
        const { accent: preview } = validateChannels(formApi.state.values);
        if (preview) {
          applyAccent(preview);
          setLiveMessage("Previewing accent color.");
        }
      },
    },
    onSubmit: ({ value }) => {
      const { accent: nextAccent } = validateChannels(value);
      if (!nextAccent) return;
      setAccent(nextAccent);
      form.reset(toDraftChannels(nextAccent));
      applyAccent(nextAccent);
      safeSetStorage(StorageKey.Accent, nextAccent);
      setIsOpen(false);
      triggerRef.current?.focus();
      setLiveMessage("Accent color applied.");
    },
    onSubmitInvalid: ({ value }) => {
      setLiveMessage(
        "Invalid accent channels. " +
          Object.values(getChannelErrors(value)).join(" "),
      );
    },
  });
  const draft = useSelector(form.store, (state) => state.values);
  const activeErrorMessages = Object.values(getChannelErrors(draft));

  useEffect(() => {
    const resolvedAccent = resolveAccent(safeGetStorage(StorageKey.Accent));

    if (resolvedAccent === DEFAULT_ACCENT) {
      safeRemoveStorage(StorageKey.Accent);
    }

    setAccent(resolvedAccent);
    form.reset(toDraftChannels(resolvedAccent));
    applyAccent(resolvedAccent);
    setMounted(true);
  }, [form]);

  useLayoutEffect(() => {
    if (!mounted || !focusFrom || focusHandledRef.current) return;
    focusHandledRef.current = true;
    // Replacing the loading trigger drops focus to body. Keep a user's newer
    // focus target if they moved elsewhere while the module was loading.
    if (
      document.activeElement === document.body ||
      document.activeElement === focusFrom
    ) {
      triggerRef.current?.focus();
    }
  }, [focusFrom, mounted]);

  const closeWithoutApply = useCallback(() => {
    form.reset(toDraftChannels(accent));
    applyAccent(accent);
    setIsOpen(false);
    setLiveMessage("Accent picker closed without applying changes.");
  }, [accent, form]);

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
        triggerRef.current?.focus();
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

  const openPicker = useCallback(() => {
    form.reset(toDraftChannels(accent));
    setLiveMessage("");
    setIsOpen(true);
  }, [accent, form]);

  const handleHexChange = useCallback(
    (hex: string) => {
      const parsed = toValidOklch(hex);
      if (!parsed) return;
      const nextDraft = toDraftChannels(formatOklch(parsed));
      form.reset(nextDraft);

      const { accent: previewAccent } = validateChannels(nextDraft);
      if (previewAccent) {
        applyAccent(previewAccent);
        setLiveMessage("Previewing accent color.");
      }
    },
    [form],
  );

  const resetAccent = useCallback(() => {
    setAccent(DEFAULT_ACCENT);
    form.reset(toDraftChannels(DEFAULT_ACCENT));
    applyAccent(DEFAULT_ACCENT);
    safeRemoveStorage(StorageKey.Accent);
    setLiveMessage("Accent reset to default.");
  }, [form]);

  if (!mounted) {
    return <div className="accent-toggle" aria-hidden="true" />;
  }

  return (
    <div className="accent-control" ref={controlRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? closeWithoutApply : openPicker}
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
        <Icon icon={slidersIcon} />
      </button>

      {isOpen && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
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
            {channels.map((channel) => (
              <form.Field key={channel.name} name={channel.name}>
                {(field) => (
                  <label className="accent-channel" htmlFor={channel.id}>
                    <span>{channel.label}</span>
                    <input
                      id={channel.id}
                      type="number"
                      min={channel.min}
                      max={channel.max}
                      step={channel.step}
                      className={
                        "accent-input" +
                        (field.state.meta.errors.length ? " invalid" : "")
                      }
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={field.state.meta.errors.length > 0}
                      aria-describedby="accent-channel-errors"
                      autoComplete="off"
                    />
                  </label>
                )}
              </form.Field>
            ))}
          </div>
          <p
            id="accent-channel-errors"
            className={
              "accent-input-hint" + (activeErrorMessages.length ? " error" : "")
            }
          >
            {activeErrorMessages.join(" ")}
          </p>

          <div className="accent-actions">
            <button type="submit" className="accent-apply">
              Apply
            </button>
            <button
              type="button"
              className="accent-reset"
              onClick={resetAccent}
            >
              Reset to default
            </button>
          </div>
        </form>
      )}

      <p className="sr-only" aria-live="polite" role="status">
        {liveMessage}
      </p>
    </div>
  );
}

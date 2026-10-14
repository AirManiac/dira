"use client"

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Hash,
  Laptop,
  MapPin,
  MousePointer2,
  Smartphone,
  Tablet,
  Terminal,
  UserRound,
  Workflow,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import type { ClickEvent } from "@/types/click";

interface EventDetailPanelProps {
  event: ClickEvent | null;
  onClose?: () => void;
}

const STATUS_STYLES = {
  success: {
    label: "Success",
    className: "border-[#8ba870]/25 bg-[#8ba870]/10 text-[#a8c493]",
  },
  redirect: {
    label: "Redirect",
    className: "border-sky-400/20 bg-sky-400/[0.07] text-sky-300",
  },
  not_found: {
    label: "Not found",
    className: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
  },
  error: {
    label: "Error",
    className: "border-red-400/20 bg-red-400/[0.07] text-red-300",
  },
} as const;

const DEVICE_LABELS = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  bot: "Bot",
} as const;

function formatTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "Unknown";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function formatResponseTime(responseTime: number): string {
  if (!Number.isFinite(responseTime) || responseTime < 0) {
    return "Unavailable";
  }

  return `${new Intl.NumberFormat("en-US").format(responseTime)} ms`;
}

function formatCoordinates(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "Coordinates unavailable";
  }

  const latDirection = latitude >= 0 ? "N" : "S";
  const lngDirection = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ${Math.abs(longitude).toFixed(4)}° ${lngDirection}`;
}

function DetailRow({
  label,
  value,
  icon: Icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#85867e]">
        <Icon size={15} strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#777970]">
          {label}
        </p>

        <p
          className={`mt-1.5 break-words text-xs leading-5 text-[#d7d8d0] ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#85867e]">
      {children}
    </h3>
  );
}

export function EventDetailPanel({
  event,
  onClose,
}: EventDetailPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setCopyError(null);

      // The success indicator is cleared when another value is copied.
      // No timer is needed for this lightweight panel.
    } catch {
      setCopiedField(null);
      setCopyError("Clipboard access is unavailable in this context.");
    }
  }

  if (!event) {
    return (
      <aside
        aria-label="Event details"
        className="flex min-h-[340px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111210]"
      >
        <div className="border-b border-white/[0.07] px-5 py-4">
          <p className="text-sm font-medium text-[#e8e8e0]">
            Event details
          </p>
          <p className="mt-1 text-xs text-[#777970]">
            Request inspection
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#85867e]">
            <MousePointer2 size={19} strokeWidth={1.5} />
          </div>

          <p className="mt-4 text-sm font-medium text-[#d7d8d0]">
            Select an event to inspect
          </p>

          <p className="mt-2 max-w-[240px] text-xs leading-5 text-[#777970]">
            Choose a row from the event explorer to see its request and
            redirect details here.
          </p>
        </div>
      </aside>
    );
  }

  const status = STATUS_STYLES[event.status];
  const isValidResponseTime =
    Number.isFinite(event.responseTime) && event.responseTime >= 0;

  const location = [event.city, event.country]
    .filter((value) => value.trim().length > 0)
    .join(", ");

  const safeLocation = location || "Unknown location";
  const safeDestination = event.destination || "Destination unavailable";
  const safeReferrer = event.referrer || "Direct / unknown";
  const coordinates = formatCoordinates(event.latitude, event.longitude);

  const deviceIcon =
    event.device === "mobile"
      ? Smartphone
      : event.device === "tablet"
        ? Tablet
        : event.device === "bot"
          ? Workflow
          : Laptop;

  return (
    <aside
      aria-label="Event details"
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111210]"
    >
      {/* Panel header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#8ba870]" />
            <p className="text-sm font-medium text-[#e8e8e0]">
              Event details
            </p>
          </div>

          <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-[#777970]">
            Request inspection
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#85867e] transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <XCircle size={15} />
          </button>
        )}
      </div>

      <div className="space-y-6 p-5">
        {/* Status and response time */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${status.className}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {status.label}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-[#a3a49b]">
              <Clock3 size={13} />
              {formatResponseTime(event.responseTime)}
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-white/[0.07] bg-[#0d0d0c] p-4">
            <p className="text-[10px] uppercase tracking-[0.13em] text-[#777970]">
              Short link
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-mono text-sm text-[#e8e8e0]">
                /{event.slug}
              </p>

              <button
                type="button"
                onClick={() => void copyValue("slug", event.slug)}
                aria-label="Copy slug"
                className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-[#85867e] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {copiedField === "slug" ? (
                  <Check size={14} className="text-[#a8c493]" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            <div className="my-4 h-px bg-white/[0.07]" />

            <p className="text-[10px] uppercase tracking-[0.13em] text-[#777970]">
              Destination
            </p>

            <p className="mt-2 break-all text-xs leading-5 text-[#b7b8af]">
              {safeDestination}
            </p>

            <button
              type="button"
              onClick={() => void copyValue("destination", event.destination)}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-[#92938b] transition-colors hover:text-[#c5c6bd]"
            >
              {copiedField === "destination" ? (
                <>
                  <Check size={12} className="text-[#a8c493]" />
                  Copied destination
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy destination
                </>
              )}
            </button>
          </div>

          {copyError && (
            <p role="status" className="mt-2 text-[11px] text-amber-300">
              {copyError}
            </p>
          )}
        </section>

        {/* Request identity */}
        <section>
          <SectionTitle>Request identity</SectionTitle>

          <div className="mt-2 divide-y divide-white/[0.06]">
            <DetailRow
              label="Event ID"
              value={event.id}
              icon={Hash}
              mono
            />

            <DetailRow
              label="Link slug"
              value={event.slug}
              icon={ExternalLink}
              mono
            />

            <DetailRow
              label="Timestamp"
              value={formatTimestamp(event.timestamp)}
              icon={CalendarClock}
            />
          </div>
        </section>

        {/* Performance */}
        <section>
          <SectionTitle>Performance</SectionTitle>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3.5">
              <div className="flex items-center gap-1.5 text-[#85867e]">
                <Clock3 size={13} />
                <span className="text-[10px]">Response time</span>
              </div>

              <p className="mt-3 text-lg font-medium tracking-tight text-[#e8e8e0] tabular-nums">
                {isValidResponseTime ? `${event.responseTime} ms` : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3.5">
              <div className="flex items-center gap-1.5 text-[#85867e]">
                <Activity size={13} />
                <span className="text-[10px]">Outcome</span>
              </div>

              <p className="mt-3 text-sm font-medium text-[#e8e8e0]">
                {status.label}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.06] px-3.5 py-3">
            {event.status === "error" || event.status === "not_found" ? (
              <ArrowDownRight
                size={14}
                className="mt-0.5 shrink-0 text-amber-300"
              />
            ) : (
              <ArrowUpRight
                size={14}
                className="mt-0.5 shrink-0 text-[#a8c493]"
              />
            )}

            <p className="text-[11px] leading-5 text-[#92938b]">
              This panel reports the event status and recorded response
              time. It does not infer an HTTP status code that the event
              does not contain.
            </p>
          </div>
        </section>

        {/* Geography and device */}
        <section>
          <SectionTitle>Origin</SectionTitle>

          <div className="mt-2 divide-y divide-white/[0.06]">
            <DetailRow
              label="Location"
              value={safeLocation}
              icon={MapPin}
            />

            <DetailRow
              label="Coordinates"
              value={coordinates}
              icon={Globe2}
              mono
            />

            <DetailRow
              label="Device"
              value={DEVICE_LABELS[event.device]}
              icon={deviceIcon}
            />
          </div>
        </section>

        {/* Referrer and user agent */}
        <section>
          <SectionTitle>Request context</SectionTitle>

          <div className="mt-2 divide-y divide-white/[0.06]">
            <DetailRow
              label="Referrer"
              value={safeReferrer}
              icon={ArrowUpRight}
            />

            <DetailRow
              label="User agent"
              value={event.userAgent || "Unavailable"}
              icon={UserRound}
              mono
            />
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[#777970]">
            <Terminal size={12} />
            Event inspector
          </span>

          <span className="font-mono text-[10px] text-[#65675f]">
            {event.id.slice(0, 12)}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default EventDetailPanel;
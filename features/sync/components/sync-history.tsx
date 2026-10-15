import {
  CalendarClockIcon,
  ChevronRightIcon,
  HistoryIcon,
  MousePointerClickIcon,
  TerminalIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime, formatDuration, formatNumber } from "@/lib/format"
import { SyncStatusBadge } from "@/features/sync/components/sync-status-badge"
import type { SyncLog } from "@/features/sync/types"

const TRIGGERS: Record<string, { label: string; icon: LucideIcon }> = {
  manual: { label: "Manual", icon: MousePointerClickIcon },
  schedule: { label: "Schedule", icon: CalendarClockIcon },
  cli: { label: "CLI", icon: TerminalIcon },
}

function durationMs(log: SyncLog) {
  if (!log.finished_at) return null
  return Date.parse(log.finished_at) - Date.parse(log.started_at)
}

export function SyncHistory({ logs }: { logs: SyncLog[] }) {
  if (!logs.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyTitle>No sync runs yet</EmptyTitle>
          <EmptyDescription>
            Run a sync to pull the catalog and daily prices from the provider.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table aria-label="Sync history">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Price points</TableHead>
              <TableHead className="w-2/5 pr-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="align-top">
                <TableCell className="pl-4">
                  <SyncStatusBadge status={log.status} />
                </TableCell>
                <TableCell>
                  <Trigger trigger={log.trigger} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  <time dateTime={log.started_at}>
                    {formatDateTime(log.started_at)}
                  </time>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatDuration(durationMs(log))}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {log.status === "success"
                    ? formatNumber(log.records_updated)
                    : "—"}
                </TableCell>
                <TableCell className="pr-4 whitespace-normal">
                  <Details log={log} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden" aria-label="Sync history">
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-col gap-2 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10"
          >
            <div className="flex items-center justify-between gap-2">
              <SyncStatusBadge status={log.status} />
              <Trigger trigger={log.trigger} />
            </div>
            <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground tabular-nums">
              <time dateTime={log.started_at}>
                {formatDateTime(log.started_at)}
              </time>
              <span>
                {formatDuration(durationMs(log))}
                {log.status === "success" &&
                  ` · ${formatNumber(log.records_updated)} pts`}
              </span>
            </div>
            {log.error && <Details log={log} />}
          </li>
        ))}
      </ul>
    </>
  )
}

function Trigger({ trigger }: { trigger: string }) {
  const { label, icon: Icon } = TRIGGERS[trigger] ?? {
    label: trigger,
    icon: TerminalIcon,
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}

function Details({ log }: { log: SyncLog }) {
  if (log.error) {
    return (
      <details className="group min-w-0">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-destructive outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <ChevronRightIcon
            className="size-3.5 transition-transform group-open:rotate-90"
            aria-hidden
          />
          Error details
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted px-3 py-2 font-mono text-xs break-words whitespace-pre-wrap text-muted-foreground">
          {log.error}
        </pre>
      </details>
    )
  }
  if (log.status === "running") {
    return <span className="text-muted-foreground">In progress…</span>
  }
  return (
    <span className="text-muted-foreground">
      {log.records_updated
        ? "New daily prices appended"
        : "Up to date — nothing new"}
    </span>
  )
}

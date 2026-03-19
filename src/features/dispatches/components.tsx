import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import {
  DispatchEvidence,
  DispatchRecord,
  DispatchStatus,
  DISPATCH_STATUS_FLOW,
  dispatchStatusLabel,
} from "@/features/dispatches/model";

const statusStyles: Record<DispatchStatus, { dot: string; chip: string }> = {
  en_almacen: {
    dot: "bg-slate-500",
    chip: "border border-slate-300 bg-slate-100 text-slate-700",
  },
  en_preparacion: {
    dot: "bg-amber-500",
    chip: "border border-amber-300 bg-amber-50 text-amber-700",
  },
  cargado: {
    dot: "bg-indigo-600",
    chip: "border border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  en_transito: {
    dot: "bg-blue-600",
    chip: "border border-blue-300 bg-blue-50 text-blue-700",
  },
  entregado: {
    dot: "bg-emerald-600",
    chip: "border border-emerald-300 bg-emerald-50 text-emerald-700",
  },
};

const statCardAccent: Record<"neutral" | DispatchStatus, string> = {
  neutral: "from-white to-brand-surface",
  en_almacen: "from-slate-50 to-white",
  en_preparacion: "from-amber-50 to-white",
  cargado: "from-indigo-50 to-white",
  en_transito: "from-blue-50 to-white",
  entregado: "from-emerald-50 to-white",
};

type StatusBadgeProps = {
  status: DispatchStatus;
  className?: string;
};

export function DispatchStatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        style.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {dispatchStatusLabel(status)}
    </span>
  );
}

type TimelineProps = {
  status: DispatchStatus;
  className?: string;
};

export function DispatchTimeline({ status, className }: TimelineProps) {
  const activeIndex = DISPATCH_STATUS_FLOW.indexOf(status);

  return (
    <div className={cn("rounded-xl border border-brand-border bg-brand-surface/70 p-3", className)}>
      <div className="grid gap-3 sm:grid-cols-5">
        {DISPATCH_STATUS_FLOW.map((step, index) => {
          const isDone = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={step} className="relative">
              {index < DISPATCH_STATUS_FLOW.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-3 top-3 hidden h-[2px] w-[calc(100%-8px)] sm:block",
                    isDone ? "bg-emerald-500/70" : "bg-brand-border",
                  )}
                />
              ) : null}

              <div className="relative flex items-center gap-2 sm:flex-col sm:items-start">
                <span
                  className={cn(
                    "z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold",
                    isCurrent
                      ? "border-blue-300 bg-blue-600 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                      : isDone
                        ? "border-emerald-300 bg-emerald-600 text-white"
                        : "border-brand-border bg-white text-brand-muted",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isCurrent ? "text-blue-700" : isDone ? "text-emerald-700" : "text-brand-muted",
                  )}
                >
                  {dispatchStatusLabel(step)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SummaryProps = {
  dispatch: DispatchRecord;
  actions?: ReactNode;
};

export function DispatchSummaryCard({ dispatch, actions }: SummaryProps) {
  return (
    <Card className="rounded-xl border-brand-border bg-gradient-to-br from-white to-brand-surface/50 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Despacho</p>
          <h2 className="text-xl font-black text-brand-ink">{dispatch.idDespacho}</h2>
          <p className="mt-1 text-sm text-brand-muted">{dispatch.fecha}</p>
        </div>
        <DispatchStatusBadge status={dispatch.estatus} className="mt-1" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <InfoCell label="Cliente" value={dispatch.cliente} />
        <InfoCell label="Origen" value={dispatch.origen} />
        <InfoCell label="Destino" value={dispatch.destino} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoCell label="Factura asociada" value={dispatch.facturaAsociada} />
        <InfoCell label="Guía asociada" value={dispatch.guiaAsociada} />
      </div>

      <div className="mt-4 rounded-lg border border-brand-border bg-white px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">Ubicación actual</p>
        <p className="mt-1 text-sm font-semibold text-brand-text">{dispatch.ubicacion.direccion}</p>
      </div>

      <DispatchTimeline status={dispatch.estatus} className="mt-4" />
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </Card>
  );
}

type LocationPanelProps = {
  dispatch: DispatchRecord;
  className?: string;
};

export function DispatchLocationPanel({ dispatch, className }: LocationPanelProps) {
  const mapUrl = `https://www.google.com/maps?q=${dispatch.ubicacion.lat},${dispatch.ubicacion.lng}`;
  return (
    <Card className={cn("rounded-xl border-brand-border bg-white shadow-none", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-muted">Ubicación del despacho</h3>
      <p className="mt-2 text-base font-semibold text-brand-ink">{dispatch.ubicacion.direccion}</p>
      <p className="mt-1 text-sm text-brand-muted">
        Lat: {dispatch.ubicacion.lat} · Lng: {dispatch.ubicacion.lng}
      </p>
      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
        <Button className="rounded-md">Ver en mapa</Button>
      </a>
    </Card>
  );
}

type EvidencePanelProps = {
  dispatch: DispatchRecord;
  className?: string;
};

export function DispatchEvidencePanel({ dispatch, className }: EvidencePanelProps) {
  return (
    <Card className={cn("rounded-xl border-brand-border bg-white shadow-none", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-muted">Evidencia del despacho</h3>
      {dispatch.evidencias.length === 0 ? (
        <p className="mt-2 text-sm text-brand-muted">Sin evidencia visual registrada en la etapa actual.</p>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {dispatch.evidencias.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}

type DashboardStatCardProps = {
  label: string;
  value: number;
  accent?: "neutral" | DispatchStatus;
  active?: boolean;
  onClick?: () => void;
};

export function DashboardStatCard({ label, value, accent = "neutral", active = false, onClick }: DashboardStatCardProps) {
  const interactive = typeof onClick === "function";

  const className = cn(
    "rounded-xl border-brand-border bg-gradient-to-br shadow-none",
    statCardAccent[accent],
    interactive ? "cursor-pointer transition hover:border-brand-primary/60 hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)]" : "",
    active ? "border-brand-primary ring-2 ring-brand-primary/20" : "",
  );

  const content = (
    <>
      <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">{label}</p>
      <p className="mt-2 text-4xl font-black text-brand-ink">{value}</p>
    </>
  );

  if (interactive) {
    return (
      <button type="button" className="w-full text-left" onClick={onClick}>
        <Card className={className}>{content}</Card>
      </button>
    );
  }

  return (
    <Card className={className}>
      {content}
    </Card>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-text">{value}</p>
    </div>
  );
}

function EvidenceCard({ item }: { item: DispatchEvidence }) {
  return (
    <article className="overflow-hidden rounded-lg border border-brand-border bg-brand-surface/40">
      <div className="h-32 w-full overflow-hidden bg-brand-surface">
        <img src={item.imageUrl} alt={`Evidencia ${dispatchStatusLabel(item.etapa)}`} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">{dispatchStatusLabel(item.etapa)}</p>
        <p className="mt-1 text-sm text-brand-text">{item.descripcion}</p>
      </div>
    </article>
  );
}

type DispatchTableProps = {
  dispatches: DispatchRecord[];
  showClient?: boolean;
  onView: (dispatch: DispatchRecord) => void;
  onDownloadDispatch: (dispatch: DispatchRecord) => void;
};

export function DispatchTable({
  dispatches,
  showClient = true,
  onView,
  onDownloadDispatch,
}: DispatchTableProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-brand-border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-auto md:block">
        <table className="w-full min-w-[1120px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[12%]" />
            {showClient ? <col className="w-[18%]" /> : null}
            <col className={showClient ? "w-[8%]" : "w-[10%]"} />
            <col className={showClient ? "w-[16%]" : "w-[18%]"} />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-brand-surface text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">ID despacho</th>
              {showClient ? <th className="px-4 py-3 font-semibold">Cliente</th> : null}
              <th className="px-4 py-3 font-semibold">Origen</th>
              <th className="px-4 py-3 font-semibold">Destino</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Factura asociada</th>
              <th className="px-4 py-3 font-semibold">Guía asociada</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((dispatch) => (
              <tr key={dispatch.idDespacho} className="border-t border-brand-border transition hover:bg-brand-surface/70">
                <td className="px-4 py-3 font-semibold leading-tight text-brand-ink">{dispatch.idDespacho}</td>
                {showClient ? <td className="px-4 py-3 leading-tight">{dispatch.cliente}</td> : null}
                <td className="px-4 py-3 leading-tight">{dispatch.origen}</td>
                <td className="px-4 py-3 leading-tight">{dispatch.destino}</td>
                <td className="px-4 py-3 leading-tight">{dispatch.fecha}</td>
                <td className="px-4 py-3">
                  <DispatchStatusBadge status={dispatch.estatus} />
                </td>
                <td className="px-4 py-3 leading-tight">{dispatch.facturaAsociada}</td>
                <td className="px-4 py-3 leading-tight">{dispatch.guiaAsociada}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-9 w-9 rounded-md px-0"
                      onClick={() => onView(dispatch)}
                      title="Ver detalle"
                      aria-label="Ver detalle"
                    >
                      <EyeIcon className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                      className="h-9 w-9 rounded-md px-0"
                      disabled={!dispatch.facturaDoc && !dispatch.guiaDoc}
                      onClick={() => onDownloadDispatch(dispatch)}
                      title="Descargar archivos"
                      aria-label="Descargar archivos"
                    >
                      <DownloadIcon className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Z" />
      <path d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

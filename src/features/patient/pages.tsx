import { ReactNode, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ResultDocument } from "@/app/types";
import { DanaLayout } from "@/components/layout/DanaLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import {
  DashboardStatCard,
  DownloadIcon,
  DispatchTable,
  DispatchSummaryCard,
  EyeIcon,
} from "@/features/dispatches/components";
import {
  buildDispatches,
  detectClientsFromDispatches,
  DispatchRecord,
  DispatchStatus,
} from "@/features/dispatches/model";
import { useResultsStore } from "@/features/results/useResultsStore";
import { mockPatients } from "@/mocks/patients";

type StatusFilter = "all" | DispatchStatus;

type TypeFilter = "all" | "factura" | "guia";

function useActiveClient() {
  const session = useDemoRoleStore((s) => s.patientSession);

  return useMemo(() => {
    if (session === null) return null;
    return mockPatients.find((item) => item.id === session.patientId) || null;
  }, [session]);
}

function resolveDocumentUrl(doc: ResultDocument) {
  return doc.url || doc.fileUrl;
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function DispatchDetailModal({
  dispatch,
  onClose,
  onOpenDocument,
  onDownload,
}: {
  dispatch: DispatchRecord | null;
  onClose: () => void;
  onOpenDocument: (doc: ResultDocument) => void;
  onDownload: (doc: ResultDocument) => void;
}) {
  if (!dispatch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg p-0 shadow-none">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div>
            <p className="font-semibold">Despacho {dispatch.idDespacho}</p>
            <p className="text-xs text-brand-muted">{dispatch.fecha}</p>
          </div>
          <Button variant="ghost" className="rounded-md" onClick={onClose}>Cerrar</Button>
        </div>

        <div className="grid gap-4 p-4">
          <DispatchSummaryCard
            dispatch={dispatch}
            actions={(
              <div className="grid w-full gap-2 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-md border border-brand-border bg-white px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">Factura</span>
                  <div className="flex items-center gap-2">
                    <IconActionButton
                      title="Ver factura"
                      onClick={() => dispatch.facturaDoc && onOpenDocument(dispatch.facturaDoc)}
                      disabled={!dispatch.facturaDoc}
                    >
                      <EyeIcon className="h-6 w-6 text-white" />
                    </IconActionButton>
                    <IconActionButton
                      title="Descargar factura"
                      onClick={() => dispatch.facturaDoc && onDownload(dispatch.facturaDoc)}
                      disabled={!dispatch.facturaDoc}
                    >
                      <DownloadIcon className="h-6 w-6 text-white" />
                    </IconActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-brand-border bg-white px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">Guía</span>
                  <div className="flex items-center gap-2">
                    <IconActionButton
                      title="Ver guía"
                      onClick={() => dispatch.guiaDoc && onOpenDocument(dispatch.guiaDoc)}
                      disabled={!dispatch.guiaDoc}
                    >
                      <EyeIcon className="h-6 w-6 text-white" />
                    </IconActionButton>
                    <IconActionButton
                      title="Descargar guía"
                      onClick={() => dispatch.guiaDoc && onDownload(dispatch.guiaDoc)}
                      disabled={!dispatch.guiaDoc}
                    >
                      <DownloadIcon className="h-6 w-6 text-white" />
                    </IconActionButton>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  );
}

function IconActionButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      className="h-11 w-11 rounded-md px-0"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

function DocumentDetailModal({
  document,
  onClose,
  onDownload,
}: {
  document: ResultDocument | null;
  onClose: () => void;
  onDownload: (doc: ResultDocument) => void;
}) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg p-0 shadow-none">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div>
            <p className="font-semibold">{document.tipoDocumento} {document.numeroFactura || document.numeroGuia}</p>
            <p className="text-xs text-brand-muted">{document.fechaEmision}</p>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-md" onClick={() => onDownload(document)}>Descargar</Button>
            <Button variant="ghost" className="rounded-md" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_2fr]">
          <div className="rounded-lg border border-brand-border bg-brand-surface p-4 text-sm">
            <p><strong>Cliente:</strong> {document.cliente}</p>
            <p><strong>Tipo:</strong> {document.tipoDocumento}</p>
            <p><strong>Numero:</strong> {document.numeroFactura || document.numeroGuia || "N/A"}</p>
            <p><strong>Origen:</strong> {document.origen || "N/A"}</p>
            <p><strong>Destino:</strong> {document.destino || "N/A"}</p>
            <p><strong>Fecha:</strong> {document.fechaEmision}</p>
          </div>
          <div className="h-[65vh] overflow-hidden rounded-lg border border-brand-border bg-white">
            <iframe src={resolveDocumentUrl(document)} title={document.fileName} className="h-full w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function PatientMedicalResultsPage() {
  const role = useDemoRoleStore((s) => s.role);
  const addEvent = useAuditStore((s) => s.addEvent);
  const client = useActiveClient();
  const documents = useResultsStore((s) => s.documents);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchRecord | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ResultDocument | null>(null);

  const allDispatches = useMemo(() => {
    if (!client) return [];
    const all = buildDispatches(documents);
    return all.filter((dispatch) => dispatch.patientId === client.id);
  }, [client, documents]);

  const filteredDispatches = useMemo(() => {
    const q = normalizeText(query.trim());

    return allDispatches.filter((dispatch) => {
      if (statusFilter !== "all" && dispatch.estatus !== statusFilter) return false;
      if (typeFilter === "factura" && dispatch.facturaDoc === null) return false;
      if (typeFilter === "guia" && dispatch.guiaDoc === null) return false;

      if (!q) return true;
      const text = normalizeText(
        `${dispatch.idDespacho} ${dispatch.cliente} ${dispatch.origen} ${dispatch.destino} ${dispatch.facturaAsociada} ${dispatch.guiaAsociada}`,
      );
      return text.includes(q);
    });
  }, [allDispatches, query, statusFilter, typeFilter]);

  const detectedClients = useMemo(() => detectClientsFromDispatches(buildDispatches(documents)), [documents]);
  const detectedClient = detectedClients.find((item) => item.id === client?.id) || null;

  if (role !== "cliente") {
    return <Navigate to="/portal/usuario" replace />;
  }

  const onDownload = (doc: ResultDocument) => {
    addEvent("download_clicked", `cliente:${client?.documentId || "anon"}`, `Descarga de ${doc.tipoDocumento} ${doc.id}`);
    const anchor = document.createElement("a");
    anchor.href = resolveDocumentUrl(doc);
    anchor.download = doc.fileName;
    anchor.rel = "noopener noreferrer";
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const onDownloadDispatch = (dispatch: DispatchRecord) => {
    if (dispatch.facturaDoc) onDownload(dispatch.facturaDoc);
    if (dispatch.guiaDoc) onDownload(dispatch.guiaDoc);
  };

  const totalDespachos = allDispatches.length;
  const enAlmacen = allDispatches.filter((d) => d.estatus === "en_almacen").length;
  const enPreparacion = allDispatches.filter((d) => d.estatus === "en_preparacion").length;
  const enTransito = allDispatches.filter((d) => d.estatus === "en_transito").length;
  const entregados = allDispatches.filter((d) => d.estatus === "entregado").length;

  return (
    <DanaLayout>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-lg border-brand-border shadow-none">
          <h1 className="text-2xl font-black text-brand-ink">Perfil Cliente · Mis despachos</h1>
          <p className="mt-2 text-sm text-brand-muted">Seguimiento de despachos con factura y guia de movilizacion asociadas.</p>
        </Card>

        {client === null ? (
          <Card className="mt-4 rounded-lg shadow-none">
            <p className="text-sm text-brand-muted">No hay una sesion de cliente activa.</p>
            <Link to="/access" className="mt-3 inline-block">
              <Button className="rounded-md">Volver al acceso</Button>
            </Link>
          </Card>
        ) : (
          <>
            <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <DashboardStatCard label="Mis despachos" value={totalDespachos} />
              <DashboardStatCard label="En almacén" value={enAlmacen} accent="en_almacen" />
              <DashboardStatCard label="En preparación" value={enPreparacion} accent="en_preparacion" />
              <DashboardStatCard label="En tránsito" value={enTransito} accent="en_transito" />
              <DashboardStatCard label="Entregados" value={entregados} accent="entregado" />
            </section>

            <Card className="mt-4 rounded-lg shadow-none">
              <h2 className="text-base font-semibold">Informacion de mi cuenta</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><strong>Cliente:</strong> {detectedClient?.nombreCliente || client.nombreCliente || client.fullName}</p>
                <p><strong>RIF:</strong> {detectedClient?.rif || client.rif || client.documentId}</p>
                <p><strong>Contacto principal:</strong> {client.contactoPrincipal || client.fullName}</p>
                <p><strong>Correo:</strong> {client.correo || client.email}</p>
                <p><strong>Telefono:</strong> {client.telefono || client.phone}</p>
                <p><strong>Direccion fiscal:</strong> {client.direccionFiscal || client.address}</p>
                <p><strong>Ciudad / Estado:</strong> {client.ciudad || "N/A"} / {client.estado || "N/A"}</p>
                <p><strong>Origen de datos:</strong> Base de datos de clientes G3 Logistica</p>
              </div>
            </Card>

            <Card className="mt-4 rounded-lg shadow-none">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="xl:col-span-2">
                  <Label htmlFor="dispatch-query">Buscar despacho</Label>
                  <Input
                    id="dispatch-query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Despacho, factura o guia"
                  />
                </div>
                <div>
                  <Label htmlFor="dispatch-status">Estado del despacho</Label>
                  <select
                    id="dispatch-status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="en_almacen">En almacén</option>
                    <option value="en_preparacion">En preparación</option>
                    <option value="cargado">Cargado</option>
                    <option value="en_transito">En tránsito</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dispatch-type">Vista</Label>
                  <select
                    id="dispatch-type"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="factura">Con factura</option>
                    <option value="guia">Con guia</option>
                  </select>
                </div>
              </div>
            </Card>

            <DispatchTable
              dispatches={filteredDispatches}
              showClient={false}
              onView={setSelectedDispatch}
              onDownloadDispatch={onDownloadDispatch}
            />
          </>
        )}
      </section>

      <DispatchDetailModal
        dispatch={selectedDispatch}
        onClose={() => setSelectedDispatch(null)}
        onOpenDocument={(doc) => {
          setSelectedDispatch(null);
          setSelectedDoc(doc);
        }}
        onDownload={onDownload}
      />
      <DocumentDetailModal document={selectedDoc} onClose={() => setSelectedDoc(null)} onDownload={onDownload} />
    </DanaLayout>
  );
}

export function PatientOverviewPage() {
  return <Navigate to="/portal/cliente" replace />;
}

export function PatientOrdersExamsPage() {
  return <Navigate to="/portal/cliente" replace />;
}

export function PatientClinicalDocumentsPage() {
  return <Navigate to="/portal/cliente" replace />;
}

export function PatientShareResultsPage() {
  return <Navigate to="/portal/cliente" replace />;
}

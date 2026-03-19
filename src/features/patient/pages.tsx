import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ResultDocument } from "@/app/types";
import { DanaLayout } from "@/components/layout/DanaLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import {
  buildDispatches,
  detectClientsFromDispatches,
  DispatchRecord,
  DispatchStatus,
  dispatchStatusLabel,
  dispatchStatusTone,
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

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div className="rounded-lg border border-brand-border bg-brand-surface p-4 text-sm">
            <p><strong>Cliente:</strong> {dispatch.cliente}</p>
            <p><strong>Origen:</strong> {dispatch.origen}</p>
            <p><strong>Destino:</strong> {dispatch.destino}</p>
            <p><strong>Estado del despacho:</strong> {dispatchStatusLabel(dispatch.estatus)}</p>
            <p><strong>Factura asociada:</strong> {dispatch.facturaAsociada}</p>
            <p><strong>Guia de movilizacion asociada:</strong> {dispatch.guiaAsociada}</p>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-4 text-sm">
            <h3 className="font-semibold text-brand-ink">Registros asociados</h3>
            <div className="mt-3 rounded-md border border-brand-border p-3">
              <p className="font-semibold">Factura</p>
              <p className="text-brand-muted">{dispatch.facturaAsociada}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  className="rounded-md"
                  disabled={!dispatch.facturaDoc}
                  onClick={() => dispatch.facturaDoc && onOpenDocument(dispatch.facturaDoc)}
                >
                  Ver factura
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-md"
                  disabled={!dispatch.facturaDoc}
                  onClick={() => dispatch.facturaDoc && onDownload(dispatch.facturaDoc)}
                >
                  Descargar
                </Button>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-brand-border p-3">
              <p className="font-semibold">Guia de movilizacion</p>
              <p className="text-brand-muted">{dispatch.guiaAsociada}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  className="rounded-md"
                  disabled={!dispatch.guiaDoc}
                  onClick={() => dispatch.guiaDoc && onOpenDocument(dispatch.guiaDoc)}
                >
                  Ver guia
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-md"
                  disabled={!dispatch.guiaDoc}
                  onClick={() => dispatch.guiaDoc && onDownload(dispatch.guiaDoc)}
                >
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
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

  const totalDespachos = allDispatches.length;
  const enTransito = allDispatches.filter((d) => d.estatus === "en_transito").length;
  const entregados = allDispatches.filter((d) => d.estatus === "entregado").length;
  const facturas = allDispatches.filter((d) => d.facturaDoc).length;
  const guias = allDispatches.filter((d) => d.guiaDoc).length;

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
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Mis despachos</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{totalDespachos}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">En transito</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{enTransito}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Entregados</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{entregados}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Facturas asociadas</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{facturas}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Guias asociadas</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{guias}</p>
              </Card>
            </section>

            <Card className="mt-4 rounded-lg shadow-none">
              <h2 className="text-base font-semibold">Informacion de mi cuenta</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><strong>Cliente detectado:</strong> {detectedClient?.nombreCliente || client.nombreCliente || client.fullName}</p>
                <p><strong>RIF:</strong> {detectedClient?.rif || client.rif || client.documentId}</p>
                <p><strong>Contacto principal:</strong> {client.contactoPrincipal || client.fullName}</p>
                <p><strong>Correo:</strong> {client.correo || client.email}</p>
                <p><strong>Telefono:</strong> {client.telefono || client.phone}</p>
                <p><strong>Direccion fiscal:</strong> {client.direccionFiscal || client.address}</p>
                <p><strong>Ciudad / Estado:</strong> {client.ciudad || "N/A"} / {client.estado || "N/A"}</p>
                <p><strong>Origen de datos:</strong> Detectado automaticamente desde registros de despacho</p>
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
                    <option value="en_almacen">En almacen</option>
                    <option value="en_preparacion">En preparacion</option>
                    <option value="cargado_en_camion">Cargado en camion</option>
                    <option value="en_transito">En transito</option>
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

            <div className="mt-4 overflow-hidden rounded-lg border border-brand-border bg-white">
              <div className="hidden overflow-auto md:block">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="bg-brand-surface text-brand-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ID despacho</th>
                      <th className="px-4 py-3 font-semibold">Origen</th>
                      <th className="px-4 py-3 font-semibold">Destino</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Factura asociada</th>
                      <th className="px-4 py-3 font-semibold">Guia asociada</th>
                      <th className="px-4 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatches.map((dispatch) => (
                      <tr key={dispatch.idDespacho} className="border-t border-brand-border">
                        <td className="px-4 py-3 font-semibold text-brand-ink">{dispatch.idDespacho}</td>
                        <td className="px-4 py-3">{dispatch.origen}</td>
                        <td className="px-4 py-3">{dispatch.destino}</td>
                        <td className="px-4 py-3">{dispatch.fecha}</td>
                        <td className="px-4 py-3">
                          <Badge tone={dispatchStatusTone(dispatch.estatus)} className="rounded-md uppercase tracking-[0.08em]">
                            {dispatchStatusLabel(dispatch.estatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{dispatch.facturaAsociada}</td>
                        <td className="px-4 py-3">{dispatch.guiaAsociada}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button className="rounded-md" onClick={() => setSelectedDispatch(dispatch)}>Ver despacho</Button>
                            <Button
                              variant="ghost"
                              className="rounded-md"
                              disabled={!dispatch.facturaDoc}
                              onClick={() => dispatch.facturaDoc && setSelectedDoc(dispatch.facturaDoc)}
                            >
                              Factura
                            </Button>
                            <Button
                              variant="ghost"
                              className="rounded-md"
                              disabled={!dispatch.guiaDoc}
                              onClick={() => dispatch.guiaDoc && setSelectedDoc(dispatch.guiaDoc)}
                            >
                              Guia
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

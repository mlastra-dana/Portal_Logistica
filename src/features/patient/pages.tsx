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
import { useResultsStore } from "@/features/results/useResultsStore";
import { mockPatients } from "@/mocks/patients";

type TypeFilter = "all" | "Factura" | "Guia de facturacion";

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

function statusTone(status: ResultDocument["status"]): "warning" | "success" | "bad" {
  if (status === "pendiente") return "warning";
  return "success";
}

function statusLabel(status: ResultDocument["status"]) {
  if (status === "pendiente") return "Pendiente";
  if (status === "pagado") return "Pagado";
  return "Entregado";
}

function DetailModal({
  document,
  onClose,
  onDownload,
}: {
  document: ResultDocument | null;
  onClose: () => void;
  onDownload: (doc: ResultDocument) => void;
}) {
  if (document === null) return null;

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
            <p><strong>Tipo de despacho:</strong> {document.tipoDocumento}</p>
            <p><strong>Numero:</strong> {document.numeroFactura || document.numeroGuia || "N/A"}</p>
            <p><strong>Origen:</strong> {document.origen || "N/A"}</p>
            <p><strong>Destino:</strong> {document.destino || "N/A"}</p>
            <p><strong>Estado:</strong> {statusLabel(document.status)}</p>
            <p><strong>Fecha de emision:</strong> {document.fechaEmision}</p>
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
  const markAsViewed = useResultsStore((s) => s.markAsViewed);
  const getDocumentsForPatient = useResultsStore((s) => s.getDocumentsForPatient);
  const client = useActiveClient();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedDoc, setSelectedDoc] = useState<ResultDocument | null>(null);

  const allClientDocs = useMemo(() => {
    if (client === null) return [];
    return getDocumentsForPatient(client.id, {
      documentId: client.documentId,
    });
  }, [client, getDocumentsForPatient]);

  const docs = useMemo(() => {
    if (client === null) return [];

    const base = getDocumentsForPatient(client.id, {
      documentId: client.documentId,
      query,
    });

    if (typeFilter === "all") return base;
    return base.filter((doc) => doc.tipoDocumento === typeFilter);
  }, [client, getDocumentsForPatient, query, typeFilter]);

  if (role !== "cliente") {
    return <Navigate to="/portal/usuario" replace />;
  }

  const onOpen = (doc: ResultDocument) => {
    setSelectedDoc(doc);
    markAsViewed(doc.id);
    addEvent("document_view", `cliente:${client?.documentId || "anon"}`, `Consulta de ${doc.tipoDocumento} ${doc.id}`);
  };

  const onDownload = async (doc: ResultDocument) => {
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

  const facturas = allClientDocs.filter((doc) => doc.documentType === "factura").length;
  const guias = allClientDocs.filter((doc) => doc.documentType === "guia").length;

  return (
    <DanaLayout>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-lg border-brand-border shadow-none">
          <h1 className="text-2xl font-black text-brand-ink">Perfil Cliente · Mis despachos</h1>
          <p className="mt-2 text-sm text-brand-muted">Consulta de facturas y despachos del cliente activo.</p>
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
            <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Informacion de mi cuenta</p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">{client.nombreCliente || client.fullName}</p>
                <p className="mt-1 text-xs text-brand-muted">{client.rif || client.documentId}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Mis facturas</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{facturas}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Mis guias de facturacion</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{guias}</p>
              </Card>
            </section>

            <Card className="mt-4 rounded-lg shadow-none">
              <h2 className="text-base font-semibold">Informacion del cliente</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><strong>Nombre cliente:</strong> {client.nombreCliente || client.fullName}</p>
                <p><strong>RIF:</strong> {client.rif || client.documentId}</p>
                <p><strong>Contacto principal:</strong> {client.contactoPrincipal || client.fullName}</p>
                <p><strong>Correo:</strong> {client.correo || client.email}</p>
                <p><strong>Telefono:</strong> {client.telefono || client.phone}</p>
                <p><strong>Direccion fiscal:</strong> {client.direccionFiscal || client.address}</p>
                <p><strong>Ciudad / Estado:</strong> {client.ciudad || "N/A"} / {client.estado || "N/A"}</p>
                <p><strong>Estatus cuenta:</strong> {client.estatusCuenta || "Activa"}</p>
              </div>
            </Card>

            <Card className="mt-4 rounded-lg shadow-none">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <div>
                  <Label htmlFor="client-query">Buscar despacho</Label>
                  <Input
                    id="client-query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Numero de factura, guia o descripcion"
                  />
                </div>
                <div>
                  <Label htmlFor="client-type">Tipo de despacho</Label>
                  <select
                    id="client-type"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="Factura">Facturas</option>
                    <option value="Guia de facturacion">Guias de facturacion</option>
                  </select>
                </div>
              </div>
            </Card>

            <div className="mt-4 overflow-hidden rounded-lg border border-brand-border bg-white">
              <div className="hidden overflow-auto md:block">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-brand-surface text-brand-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tipo de despacho</th>
                      <th className="px-4 py-3 font-semibold">Numero</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Origen</th>
                      <th className="px-4 py-3 font-semibold">Destino</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr key={doc.id} className="border-t border-brand-border">
                        <td className="px-4 py-3">{doc.tipoDocumento}</td>
                        <td className="px-4 py-3">{doc.numeroFactura || doc.numeroGuia || "N/A"}</td>
                        <td className="px-4 py-3">{doc.fechaEmision}</td>
                        <td className="px-4 py-3">{doc.origen || "N/A"}</td>
                        <td className="px-4 py-3">{doc.destino || "N/A"}</td>
                        <td className="px-4 py-3">
                          <Badge tone={statusTone(doc.status)} className="rounded-md uppercase tracking-[0.08em]">
                            {statusLabel(doc.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button className="rounded-md" onClick={() => onOpen(doc)}>Ver detalle</Button>
                            <Button variant="ghost" className="rounded-md" onClick={() => onDownload(doc)}>Descargar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {docs.map((doc) => (
                  <Card key={doc.id} className="rounded-lg p-3 shadow-none">
                    <p className="font-semibold">{doc.tipoDocumento} {doc.numeroFactura || doc.numeroGuia}</p>
                    <p className="mt-1 text-xs text-brand-muted">{doc.fechaEmision} · {doc.origen || "N/A"} a {doc.destino || "N/A"}</p>
                    <Badge tone={statusTone(doc.status)} className="mt-2 rounded-md uppercase tracking-[0.08em]">
                      {statusLabel(doc.status)}
                    </Badge>
                    <div className="mt-3 flex gap-2">
                      <Button className="w-full rounded-md" onClick={() => onOpen(doc)}>Ver detalle</Button>
                      <Button variant="ghost" className="w-full rounded-md" onClick={() => onDownload(doc)}>Descargar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <DetailModal document={selectedDoc} onClose={() => setSelectedDoc(null)} onDownload={onDownload} />
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

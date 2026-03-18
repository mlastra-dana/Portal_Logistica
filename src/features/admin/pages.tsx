import { ReactNode, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ResultDocument } from "@/app/types";
import { AuthedLayout } from "@/components/layout/AuthedLayout";
import { RestrictedAccess } from "@/components/layout/RestrictedAccess";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import { useResultsStore } from "@/features/results/useResultsStore";
import { mockPatients } from "@/mocks/patients";

type TypeFilter = "all" | "Factura" | "Entrega";

const adminNav = [
  { to: "/portal/usuario/dashboard", label: "Clientes" },
  { to: "/portal/usuario/documentos", label: "Documentos" },
];

function AdminGuard({ children }: { children: ReactNode }) {
  const role = useDemoRoleStore((s) => s.role);
  if (role !== "usuario") {
    return <RestrictedAccess message="Tu perfil actual es cliente. Esta area esta disponible solo para Perfil Administrador." />;
  }
  return <>{children}</>;
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
            <p><strong>Tipo de documento:</strong> {document.tipoDocumento}</p>
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

export function AdminPatientsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const selectedClientId = useDemoRoleStore((s) => s.adminSelectedClientId);
  const setSelectedClientId = useDemoRoleStore((s) => s.setAdminSelectedClientId);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPatients;
    return mockPatients.filter((client) => {
      const haystack = `${client.fullName} ${client.documentId} ${client.contactoPrincipal || ""} ${client.ciudad || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const selectedClient = filteredClients.find((item) => item.id === selectedClientId) || null;

  return (
    <AuthedLayout title="Perfil Administrador · Seleccion de cliente" items={adminNav}>
      <AdminGuard>
        <Card className="rounded-xl border-brand-border bg-gradient-to-r from-brand-primary to-brand-ink p-6 text-white shadow-none">
          <p className="text-xs uppercase tracking-[0.16em] text-white/80">Consola administrativa</p>
          <h2 className="mt-2 text-2xl font-black">Clientes</h2>
          <p className="mt-2 text-sm text-white/90">Selecciona la cuenta para abrir sus documentos.</p>
        </Card>

        <Card className="mt-3 rounded-lg shadow-none">
          <Label htmlFor="search-clients">Buscar cliente</Label>
          <Input
            id="search-clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, RIF o ciudad"
          />
        </Card>

        <section className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client, index) => {
            const code = client.historyNumber || `CLI-${String(index + 1).padStart(4, "0")}`;
            const codigoCliente = `CL-${(client.rif || client.documentId).replace(/[^A-Z0-9]/gi, "").slice(-6)}`;
            const isSelected = selectedClient?.id === client.id;
            return (
              <Card
                key={client.id}
                className={`rounded-xl border shadow-none transition ${isSelected ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-brand-border"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">Cuenta {code}</p>
                    <h3 className="mt-1 text-base font-semibold text-brand-ink">{client.nombreCliente || client.fullName}</h3>
                    <p className="mt-1 text-xs text-brand-muted">{client.rif || client.documentId}</p>
                  </div>
                  <Badge tone={(client.estatusCuenta || "").toLowerCase() === "activa" ? "success" : "warning"} className="rounded-md uppercase tracking-[0.08em]">
                    {client.estatusCuenta || "N/A"}
                  </Badge>
                </div>
                <div className="mt-3 rounded-lg border border-brand-border bg-brand-surface p-2 text-xs">
                  <p><strong>Codigo cliente:</strong> {codigoCliente}</p>
                </div>
                <Button
                  className="mt-3 w-full rounded-md"
                  variant={isSelected ? "dark" : "ghost"}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    navigate("/portal/usuario/documentos");
                  }}
                >
                  Abrir
                </Button>
              </Card>
            );
          })}
        </section>
      </AdminGuard>
    </AuthedLayout>
  );
}

export function AdminUploadsPage() {
  const navigate = useNavigate();
  const addEvent = useAuditStore((s) => s.addEvent);
  const markAsViewed = useResultsStore((s) => s.markAsViewed);
  const getDocumentsForPatient = useResultsStore((s) => s.getDocumentsForPatient);
  const selectedClientId = useDemoRoleStore((s) => s.adminSelectedClientId);
  const selectedClient = mockPatients.find((item) => item.id === selectedClientId) || null;

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedDoc, setSelectedDoc] = useState<ResultDocument | null>(null);

  const allClientDocs = useMemo(() => {
    if (!selectedClient) return [];
    return getDocumentsForPatient(selectedClient.id, {
      documentId: selectedClient.documentId,
    });
  }, [getDocumentsForPatient, selectedClient]);

  const docs = useMemo(() => {
    if (!selectedClient) return [];
    const base = getDocumentsForPatient(selectedClient.id, {
      documentId: selectedClient.documentId,
      query,
    });
    if (typeFilter === "all") return base;
    return base.filter((doc) => doc.tipoDocumento === typeFilter);
  }, [getDocumentsForPatient, selectedClient, query, typeFilter]);

  const facturas = allClientDocs.filter((doc) => doc.documentType === "factura").length;
  const entregas = allClientDocs.filter((doc) => doc.documentType === "guia").length;

  const onOpen = (doc: ResultDocument) => {
    setSelectedDoc(doc);
    markAsViewed(doc.id);
    addEvent("document_view", "admin-user", `Revision de ${doc.tipoDocumento} ${doc.id}`);
  };

  const onDownload = (doc: ResultDocument) => {
    addEvent("download_clicked", "admin-user", `Descarga de ${doc.tipoDocumento} ${doc.id}`);
    const anchor = document.createElement("a");
    anchor.href = resolveDocumentUrl(doc);
    anchor.download = doc.fileName;
    anchor.rel = "noopener noreferrer";
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <AuthedLayout title="Perfil Administrador · Documentos" items={adminNav}>
      <AdminGuard>
        {selectedClient === null ? (
          <Card className="rounded-lg shadow-none">
            <p className="text-sm text-brand-muted">Debes seleccionar un cliente primero para acceder a documentos.</p>
            <Button className="mt-3 rounded-md" onClick={() => navigate("/portal/usuario/dashboard")}>
              Ir a clientes
            </Button>
          </Card>
        ) : (
          <>
            <Card className="rounded-lg border-brand-border shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-brand-ink">{selectedClient.nombreCliente || selectedClient.fullName}</h1>
                  <p className="mt-2 text-sm text-brand-muted">Ficha de cliente y documentos asociados.</p>
                </div>
                <Button variant="ghost" className="rounded-md" onClick={() => navigate("/portal/usuario/dashboard")}>
                  Cambiar cliente
                </Button>
              </div>
            </Card>

            <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Informacion de cuenta</p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">{selectedClient.nombreCliente || selectedClient.fullName}</p>
                <p className="mt-1 text-xs text-brand-muted">{selectedClient.rif || selectedClient.documentId}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Facturas</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{facturas}</p>
              </Card>
              <Card className="rounded-lg shadow-none">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Entregas</p>
                <p className="mt-2 text-3xl font-black text-brand-ink">{entregas}</p>
              </Card>
            </section>

            <Card className="mt-4 rounded-lg shadow-none">
              <h2 className="text-base font-semibold">Informacion del cliente</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><strong>Nombre cliente:</strong> {selectedClient.nombreCliente || selectedClient.fullName}</p>
                <p><strong>RIF:</strong> {selectedClient.rif || selectedClient.documentId}</p>
                <p><strong>Contacto principal:</strong> {selectedClient.contactoPrincipal || selectedClient.fullName}</p>
                <p><strong>Correo:</strong> {selectedClient.correo || selectedClient.email}</p>
                <p><strong>Telefono:</strong> {selectedClient.telefono || selectedClient.phone}</p>
                <p><strong>Direccion fiscal:</strong> {selectedClient.direccionFiscal || selectedClient.address}</p>
                <p><strong>Ciudad / Estado:</strong> {selectedClient.ciudad || "N/A"} / {selectedClient.estado || "N/A"}</p>
                <p><strong>Tipo cliente:</strong> {selectedClient.tipoCliente || "Corporativo"}</p>
                <p><strong>Estatus cuenta:</strong> {selectedClient.estatusCuenta || "Activa"}</p>
              </div>
            </Card>

            <Card className="mt-4 rounded-lg shadow-none">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <div>
                  <Label htmlFor="admin-client-query">Buscar documento</Label>
                  <Input
                    id="admin-client-query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Numero de factura, entrega o descripcion"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-client-type">Tipo de documento</Label>
                  <select
                    id="admin-client-type"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="Factura">Facturas</option>
                    <option value="Entrega">Entregas</option>
                  </select>
                </div>
              </div>
            </Card>

            <div className="mt-4 overflow-hidden rounded-lg border border-brand-border bg-white">
              <div className="hidden overflow-auto md:block">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-brand-surface text-brand-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tipo de documento</th>
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
            </div>
          </>
        )}
      </AdminGuard>

      <DetailModal document={selectedDoc} onClose={() => setSelectedDoc(null)} onDownload={onDownload} />
    </AuthedLayout>
  );
}

export function AdminAuditPage() {
  return <Navigate to="/portal/usuario/dashboard" replace />;
}

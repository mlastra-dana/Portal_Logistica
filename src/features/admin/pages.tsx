import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Patient, ResultDocument } from "@/app/types";
import { AuthedLayout } from "@/components/layout/AuthedLayout";
import { RestrictedAccess } from "@/components/layout/RestrictedAccess";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  DashboardStatCard,
  DispatchTable,
  DownloadIcon,
  DispatchSummaryCard,
  EyeIcon,
} from "@/features/dispatches/components";
import {
  buildDispatches,
  detectClientsFromDispatches,
  DispatchRecord,
  DispatchStatus,
} from "@/features/dispatches/model";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import { UploadForm } from "@/features/documents/UploadForm";
import { useResultsStore } from "@/features/results/useResultsStore";
import { mockPatients } from "@/mocks/patients";

type TypeFilter = "all" | "factura" | "guia";

type StatusFilter = "all" | DispatchStatus;

const adminNav = [
  { to: "/portal/usuario/despachos", label: "Despachos" },
  { to: "/portal/usuario/clientes", label: "Clientes" },
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

        <div className="p-4">
          <div className="mb-3 rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm">
            <p className="font-semibold text-brand-ink">{document.cliente}</p>
            <p className="text-brand-muted">
              {document.tipoDocumento} {document.numeroFactura || document.numeroGuia || "N/A"} · {document.fechaEmision}
            </p>
          </div>
          <div className="h-[72vh] overflow-hidden rounded-lg border border-brand-border bg-white">
            <iframe src={resolveDocumentUrl(document)} title={document.fileName} className="h-full w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AdminPatientsPage() {
  const navigate = useNavigate();
  const selectedClientId = useDemoRoleStore((s) => s.adminSelectedClientId);
  const setSelectedClientId = useDemoRoleStore((s) => s.setAdminSelectedClientId);
  const documents = useResultsStore((s) => s.documents);
  const [query, setQuery] = useState("");

  const detectedClients = useMemo(() => detectClientsFromDispatches(buildDispatches(documents)), [documents]);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return detectedClients;
    return detectedClients.filter((client) => {
      const haystack = `${client.nombreCliente} ${client.rif} ${client.contactoPrincipal} ${client.ciudad}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [detectedClients, query]);

  return (
    <AuthedLayout title="Perfil Administrador · Clientes" items={adminNav}>
      <AdminGuard>
        <Card className="mt-3 rounded-lg shadow-none">
          <Label htmlFor="search-clients">Clientes</Label>
          <Input
            id="search-clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente"
          />
        </Card>

        <section className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client, index) => {
            const code = `CLI-${String(index + 1).padStart(4, "0")}`;
            return (
              <Card
                key={client.id}
                className={`cursor-pointer rounded-xl border shadow-none transition ${
                  selectedClientId === client.id ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/30" : "border-brand-border hover:border-brand-primary/40"
                }`}
                onClick={() => {
                  setSelectedClientId(client.id);
                  navigate("/portal/usuario/despachos", { state: { fromClientSelection: true } });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedClientId(client.id);
                    navigate("/portal/usuario/despachos", { state: { fromClientSelection: true } });
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">Cuenta {code}</p>
                    <h3 className="mt-1 text-2xl font-semibold text-brand-ink">{client.nombreCliente}</h3>
                    <p className="mt-1 text-xs text-brand-muted">{client.rif}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      </AdminGuard>
    </AuthedLayout>
  );
}

export function AdminUploadsPage() {
  const location = useLocation();
  const navigationState = location.state as { fromClientSelection?: boolean } | null;
  const fromClientSelection = navigationState?.fromClientSelection === true;
  const addEvent = useAuditStore((s) => s.addEvent);
  const documents = useResultsStore((s) => s.documents);
  const selectedClientId = useDemoRoleStore((s) => s.adminSelectedClientId);
  const setSelectedClientId = useDemoRoleStore((s) => s.setAdminSelectedClientId);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [clientFilter, setClientFilter] = useState<string>(selectedClientId || "all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    location.pathname.endsWith("/facturas") ? "factura" : location.pathname.endsWith("/guias") ? "guia" : "all",
  );
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchRecord | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ResultDocument | null>(null);

  useEffect(() => {
    if (location.pathname.endsWith("/facturas")) {
      setTypeFilter("factura");
      setStatusFilter("all");
      return;
    }
    if (location.pathname.endsWith("/guias")) {
      setTypeFilter("guia");
      setStatusFilter("all");
      return;
    }
    if (location.pathname.endsWith("/seguimiento")) {
      setTypeFilter("all");
      setStatusFilter("en_transito");
      return;
    }
    setTypeFilter("all");
    setStatusFilter("all");
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.endsWith("/despachos")) return;
    if (fromClientSelection) return;
    setSelectedClientId(null);
    setClientFilter("all");
    setStatusFilter("all");
  }, [location.pathname, fromClientSelection, setSelectedClientId]);

  useEffect(() => {
    setClientFilter(selectedClientId || "all");
  }, [selectedClientId]);

  const dispatches = useMemo(() => buildDispatches(documents), [documents]);
  const clients = useMemo(() => detectClientsFromDispatches(dispatches), [dispatches]);

  const scopedDispatches = useMemo(() => {
    if (clientFilter === "all") return dispatches;
    return dispatches.filter((dispatch) => dispatch.patientId === clientFilter);
  }, [dispatches, clientFilter]);

  const filteredDispatches = useMemo(() => {
    const q = normalizeText(query.trim());

    return dispatches.filter((dispatch) => {
      if (clientFilter !== "all" && dispatch.patientId !== clientFilter) return false;
      if (statusFilter !== "all" && dispatch.estatus !== statusFilter) return false;
      if (typeFilter === "factura" && dispatch.facturaDoc === null) return false;
      if (typeFilter === "guia" && dispatch.guiaDoc === null) return false;

      if (!q) return true;
      const text = normalizeText(
        `${dispatch.idDespacho} ${dispatch.cliente} ${dispatch.origen} ${dispatch.destino} ${dispatch.facturaAsociada} ${dispatch.guiaAsociada}`,
      );
      return text.includes(q);
    });
  }, [dispatches, query, clientFilter, statusFilter, typeFilter]);

  const totalDespachos = scopedDispatches.length;
  const totalEnAlmacen = scopedDispatches.filter((d) => d.estatus === "en_almacen").length;
  const totalEnPreparacion = scopedDispatches.filter((d) => d.estatus === "en_preparacion").length;
  const totalEnTransito = scopedDispatches.filter((d) => d.estatus === "en_transito").length;
  const totalEntregados = scopedDispatches.filter((d) => d.estatus === "entregado").length;

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

  const onDownloadDispatch = (dispatch: DispatchRecord) => {
    if (dispatch.facturaDoc) onDownload(dispatch.facturaDoc);
    if (dispatch.guiaDoc) onDownload(dispatch.guiaDoc);
  };

  const pageTitle = location.pathname.endsWith("/facturas")
    ? "Perfil Administrador · Facturas"
    : location.pathname.endsWith("/guias")
      ? "Perfil Administrador · Guias"
      : location.pathname.endsWith("/seguimiento")
        ? "Perfil Administrador · Seguimiento"
        : "Perfil Administrador · Despachos";

  return (
    <AuthedLayout title={pageTitle} items={adminNav}>
      <AdminGuard>
        <Card className="rounded-lg border-brand-border shadow-none">
          <h1 className="text-2xl font-black text-brand-ink">Despachos operativos</h1>
        </Card>

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <DashboardStatCard
            label="Total de despachos"
            value={totalDespachos}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <DashboardStatCard
            label="En almacén"
            value={totalEnAlmacen}
            accent="en_almacen"
            active={statusFilter === "en_almacen"}
            onClick={() => setStatusFilter("en_almacen")}
          />
          <DashboardStatCard
            label="En preparación"
            value={totalEnPreparacion}
            accent="en_preparacion"
            active={statusFilter === "en_preparacion"}
            onClick={() => setStatusFilter("en_preparacion")}
          />
          <DashboardStatCard
            label="En tránsito"
            value={totalEnTransito}
            accent="en_transito"
            active={statusFilter === "en_transito"}
            onClick={() => setStatusFilter("en_transito")}
          />
          <DashboardStatCard
            label="Entregados"
            value={totalEntregados}
            accent="entregado"
            active={statusFilter === "entregado"}
            onClick={() => setStatusFilter("entregado")}
          />
        </section>

        <Card className="mt-4 rounded-lg shadow-none">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <Label htmlFor="dispatch-query">Buscar despacho</Label>
              <Input
                id="dispatch-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Despacho, cliente, factura o guia"
              />
            </div>
            <div>
              <Label htmlFor="dispatch-client">Cliente</Label>
              <select
                id="dispatch-client"
                value={clientFilter}
                onChange={(event) => {
                  const next = event.target.value;
                  setClientFilter(next);
                  setSelectedClientId(next === "all" ? null : next);
                }}
                className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.nombreCliente}</option>
                ))}
              </select>
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
          </div>

        </Card>

        <DispatchTable
          dispatches={filteredDispatches}
          showClient
          onView={setSelectedDispatch}
          onDownloadDispatch={onDownloadDispatch}
        />
      </AdminGuard>

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
    </AuthedLayout>
  );
}

export function AdminAuditPage() {
  return <Navigate to="/portal/usuario/despachos" replace />;
}

export function AdminUploadPage() {
  const documents = useResultsStore((s) => s.documents);
  const selectedClientId = useDemoRoleStore((s) => s.adminSelectedClientId);
  const setSelectedClientId = useDemoRoleStore((s) => s.setAdminSelectedClientId);

  const dispatches = useMemo(() => buildDispatches(documents), [documents]);
  const clients = useMemo(() => detectClientsFromDispatches(dispatches), [dispatches]);

  const selectedKnownPatient = mockPatients.find((item) => item.id === selectedClientId) || null;
  const selectedDetectedClient = clients.find((item) => item.id === selectedClientId) || null;

  const uploadTarget: Patient | undefined = selectedKnownPatient || (selectedDetectedClient
    ? {
        id: selectedDetectedClient.id,
        fullName: selectedDetectedClient.nombreCliente,
        documentId: selectedDetectedClient.rif,
        birthDate: "2000-01-01",
        phone: "N/A",
        email: selectedDetectedClient.correo,
        address: `${selectedDetectedClient.ciudad}, ${selectedDetectedClient.estado}`,
        company: selectedDetectedClient.nombreCliente,
        historyNumber: `AI-${selectedDetectedClient.rif.replace(/[^A-Z0-9]/gi, "").slice(-6)}`,
        insurer: "N/A",
        plan: "Cuenta empresarial",
        site: "Centro logistico principal",
        consents: [],
      }
    : undefined);

  return (
    <AuthedLayout title="Perfil Administrador · Carga de despachos" items={adminNav}>
      <AdminGuard>
        <Card className="rounded-lg border-brand-border shadow-none">
          <h1 className="text-2xl font-black text-brand-ink">Cargar despacho</h1>
          <p className="mt-2 text-sm text-brand-muted">Selecciona el cliente al que deseas asociar factura o guia de movilizacion.</p>
          <div className="mt-3">
            <Label htmlFor="upload-client-selector">Cliente</Label>
            <select
              id="upload-client-selector"
              value={selectedClientId || ""}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Selecciona una cuenta</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombreCliente} - {client.rif}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-brand-muted">Selecciona la cuenta cliente para registrar el despacho.</p>
          </div>
        </Card>

        {uploadTarget ? (
          <div className="mt-4">
            <UploadForm patient={uploadTarget} actor="admin-user" />
          </div>
        ) : (
          <Card className="mt-4 rounded-lg shadow-none">
            <p className="text-sm text-brand-muted">Selecciona un cliente para habilitar la carga.</p>
          </Card>
        )}
      </AdminGuard>
    </AuthedLayout>
  );
}

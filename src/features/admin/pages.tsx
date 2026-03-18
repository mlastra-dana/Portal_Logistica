import { ReactNode, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthedLayout } from "@/components/layout/AuthedLayout";
import { RestrictedAccess } from "@/components/layout/RestrictedAccess";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import { useResultsStore } from "@/features/results/useResultsStore";
import { mockPatients } from "@/mocks/patients";

const adminNav = [
  { to: "/portal/usuario/dashboard", label: "Resumen operativo" },
  { to: "/portal/usuario/documentos", label: "Documentos" },
];

function AdminGuard({ children }: { children: ReactNode }) {
  const role = useDemoRoleStore((s) => s.role);

  if (role !== "usuario") {
    return <RestrictedAccess message="Tu perfil actual es cliente. Esta area esta disponible solo para Perfil Administrador." />;
  }

  return <>{children}</>;
}

function statusTone(status: string): "warning" | "success" | "bad" {
  if (status === "pendiente") return "warning";
  return "success";
}

export function AdminPatientsPage() {
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(mockPatients[0]?.id || "");
  const documents = useResultsStore((s) => s.documents);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPatients;
    return mockPatients.filter((client) => {
      const haystack = `${client.fullName} ${client.documentId} ${client.contactoPrincipal || ""} ${client.ciudad || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const selectedClient = filteredClients.find((item) => item.id === selectedClientId) || filteredClients[0] || null;
  const selectedClientDocs = selectedClient ? documents.filter((doc) => doc.patientId === selectedClient.id) : [];

  const totalFacturas = documents.filter((doc) => doc.documentType === "factura").length;
  const totalGuias = documents.filter((doc) => doc.documentType === "guia").length;
  const clientesActivos = mockPatients.filter((client) => (client.estatusCuenta || "").toLowerCase() === "activa").length;

  return (
    <AuthedLayout title="Perfil Administrador · Resumen operativo" items={adminNav}>
      <AdminGuard>
        <section className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Total de facturas</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalFacturas}</p>
          </Card>
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Total de entregas</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalGuias}</p>
          </Card>
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Clientes activos</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{clientesActivos}</p>
          </Card>
        </section>

        <Card className="mt-3 rounded-lg shadow-none">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="search-clients">Modulo de clientes</Label>
              <Input
                id="search-clients"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cliente, RIF, contacto o ciudad"
              />
            </div>
            <div>
              <Label htmlFor="client-selector">Seleccionar cliente</Label>
              <select
                id="client-selector"
                value={selectedClient?.id || ""}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
              >
                {filteredClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {(client.nombreCliente || client.fullName)} - {client.rif || client.documentId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="mt-3 rounded-lg shadow-none">
          <h3 className="text-base font-semibold">Informacion del cliente</h3>
          {selectedClient ? (
            <>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
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

              <div className="mt-4 rounded-md border border-brand-border bg-brand-surface p-3 text-sm">
                <p><strong>Documentos asociados:</strong> {selectedClientDocs.length}</p>
                <p><strong>Facturas:</strong> {selectedClientDocs.filter((doc) => doc.documentType === "factura").length}</p>
                <p><strong>Entregas:</strong> {selectedClientDocs.filter((doc) => doc.documentType === "guia").length}</p>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-brand-muted">No hay clientes para mostrar.</p>
          )}
        </Card>

        <div className="mt-3">
          <ResponsiveTable
            data={filteredClients}
            mobileTitle={(row) => row.fullName}
            columns={[
              { key: "rif", header: "RIF", render: (row) => row.documentId },
              { key: "contacto", header: "Contacto", render: (row) => row.contactoPrincipal || row.fullName },
              { key: "correo", header: "Correo", render: (row) => row.email },
              { key: "ciudad", header: "Ciudad / Estado", render: (row) => `${row.ciudad || "N/A"} / ${row.estado || "N/A"}` },
              { key: "tipo", header: "Tipo cliente", render: (row) => row.tipoCliente || "Corporativo" },
              {
                key: "estatus",
                header: "Estatus",
                render: (row) => (
                  <Badge tone={(row.estatusCuenta || "").toLowerCase() === "activa" ? "success" : "warning"} className="rounded-md uppercase tracking-[0.08em]">
                    {row.estatusCuenta || "N/A"}
                  </Badge>
                ),
              },
              {
                key: "accion",
                header: "Accion",
                render: (row) => (
                  <Button variant={selectedClient?.id === row.id ? "dark" : "ghost"} className="rounded-md" onClick={() => setSelectedClientId(row.id)}>
                    Ver cuenta
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </AdminGuard>
    </AuthedLayout>
  );
}

export function AdminUploadsPage() {
  const [query, setQuery] = useState("");
  const documents = useResultsStore((s) => s.documents);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => {
      const haystack = `${doc.cliente} ${doc.numeroFactura || ""} ${doc.numeroGuia || ""} ${doc.origen || ""} ${doc.destino || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [documents, query]);

  return (
    <AuthedLayout title="Perfil Administrador · Documentos" items={adminNav}>
      <AdminGuard>
        <Card className="rounded-lg shadow-none">
          <Label htmlFor="search-operativo">Buscar en facturas y guias de movilizacion</Label>
          <Input
            id="search-operativo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cliente, numero de documento, origen o destino"
          />
        </Card>

        <div className="mt-3">
          <ResponsiveTable
            data={filtered}
            mobileTitle={(row) => `${row.tipoDocumento} ${row.numeroFactura || row.numeroGuia || ""}`}
            columns={[
              { key: "tipo", header: "Tipo", render: (row) => row.tipoDocumento },
              { key: "numero", header: "Numero", render: (row) => row.numeroFactura || row.numeroGuia || "N/A" },
              { key: "cliente", header: "Cliente", render: (row) => row.cliente },
              { key: "fecha", header: "Fecha", render: (row) => row.fechaEmision },
              { key: "origen", header: "Origen", render: (row) => row.origen || "N/A" },
              { key: "destino", header: "Destino", render: (row) => row.destino || "N/A" },
              {
                key: "estado",
                header: "Estado del documento",
                render: (row) => (
                  <Badge tone={statusTone(row.status)} className="rounded-md uppercase tracking-[0.08em]">
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      </AdminGuard>
    </AuthedLayout>
  );
}

export function AdminAuditPage() {
  return <Navigate to="/portal/usuario/dashboard" replace />;
}

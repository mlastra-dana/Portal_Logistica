import { ReactNode, useMemo, useState } from "react";
import { AuthedLayout } from "@/components/layout/AuthedLayout";
import { RestrictedAccess } from "@/components/layout/RestrictedAccess";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { AuditLog } from "@/features/audit/AuditLog";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import { useResultsStore } from "@/features/results/useResultsStore";

const adminNav = [
  { to: "/portal/usuario/dashboard", label: "Resumen operativo" },
  { to: "/portal/usuario/documentos", label: "Documentos" },
  { to: "/portal/usuario/actividad", label: "Actividad" },
];

function AdminGuard({ children }: { children: ReactNode }) {
  const role = useDemoRoleStore((s) => s.role);

  if (role !== "administrador") {
    return <RestrictedAccess message="Tu perfil actual es cliente. Esta area esta disponible solo para Administrador G3." />;
  }

  return <>{children}</>;
}

function statusTone(status: string): "warning" | "success" | "bad" {
  if (status === "nuevo") return "warning";
  if (status === "observado") return "bad";
  return "success";
}

export function AdminPatientsPage() {
  const [query, setQuery] = useState("");
  const documents = useResultsStore((s) => s.documents);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => {
      const haystack = `${doc.cliente} ${doc.numeroFactura || ""} ${doc.numeroGuia || ""} ${doc.tipoDocumento}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [documents, query]);

  const totalFacturas = documents.filter((doc) => doc.documentType === "factura").length;
  const totalGuias = documents.filter((doc) => doc.documentType === "guia").length;
  const totalObservados = documents.filter((doc) => doc.status === "observado").length;
  const totalNuevos = documents.filter((doc) => doc.status === "nuevo").length;

  return (
    <AuthedLayout title="Perfil Administrador · Resumen operativo" items={adminNav}>
      <AdminGuard>
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Total de facturas</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalFacturas}</p>
          </Card>
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Total de guias</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalGuias}</p>
          </Card>
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Documentos nuevos</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalNuevos}</p>
          </Card>
          <Card className="rounded-lg shadow-none">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">En observacion</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">{totalObservados}</p>
          </Card>
        </section>

        <Card className="mt-3 rounded-lg shadow-none">
          <Label htmlFor="search-docs">Consulta de documentos</Label>
          <Input
            id="search-docs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, numero de factura o numero de guia"
          />
        </Card>

        <div className="mt-3">
          <ResponsiveTable
            data={filtered.slice(0, 8)}
            mobileTitle={(row) => row.cliente}
            columns={[
              { key: "tipo", header: "Tipo de documento", render: (row) => row.tipoDocumento },
              { key: "numero", header: "Numero", render: (row) => row.numeroFactura || row.numeroGuia || "N/A" },
              { key: "cliente", header: "Cliente", render: (row) => row.cliente },
              { key: "fecha", header: "Fecha", render: (row) => row.fechaEmision },
              { key: "origen", header: "Origen", render: (row) => row.origen || "N/A" },
              { key: "destino", header: "Destino", render: (row) => row.destino || "N/A" },
              {
                key: "estado",
                header: "Estado",
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
  return (
    <AuthedLayout title="Perfil Administrador · Actividad" items={adminNav}>
      <AdminGuard>
        <Card className="rounded-lg shadow-none">
          <h2 className="text-base font-semibold">Estado de documentos</h2>
          <p className="mt-2 text-sm text-brand-muted">Registro de actividad de consulta, descargas y cambios de perfil en modo demostracion.</p>
        </Card>
        <div className="mt-3">
          <AuditLog />
        </div>
      </AdminGuard>
    </AuthedLayout>
  );
}

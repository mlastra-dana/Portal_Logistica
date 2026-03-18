import { AuditEvent } from "@/app/types";

export const initialAuditEvents: AuditEvent[] = [
  {
    id: "a-001",
    type: "page_view",
    actor: "demo-user",
    message: "Navegacion a /portal/usuario/dashboard",
    timestamp: "2026-03-15T09:05:00Z",
  },
  {
    id: "a-002",
    type: "document_view",
    actor: "demo-user",
    message: "Consulta de Factura FT-2026-000431",
    timestamp: "2026-03-15T09:20:00Z",
  },
  {
    id: "a-003",
    type: "download_clicked",
    actor: "demo-user",
    message: "Descarga de Guia GM-2026-001105",
    timestamp: "2026-03-15T09:40:00Z",
  },
];

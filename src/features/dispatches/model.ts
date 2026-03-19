import { ResultDocument } from "@/app/types";
import { mockPatients } from "@/mocks/patients";

const EVIDENCIA_ALMACEN = "/sample-docs/g3/evidencias-real/En%20almacen.png";
const EVIDENCIA_PREPARACION = "/sample-docs/g3/evidencias-real/En%20preparacion.png";
const EVIDENCIA_CARGADO = "/sample-docs/g3/evidencias-real/cargado.png";
const EVIDENCIA_ENTREGADO = "/sample-docs/g3/evidencias-real/Entregado.png";

export type DispatchStatus =
  | "en_almacen"
  | "en_preparacion"
  | "cargado"
  | "en_transito"
  | "entregado";

export type DispatchRecord = {
  idDespacho: string;
  patientId: string;
  rif: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  estatus: DispatchStatus;
  facturaAsociada: string;
  guiaAsociada: string;
  facturaDoc: ResultDocument | null;
  guiaDoc: ResultDocument | null;
  ubicacion: DispatchLocation;
  evidencias: DispatchEvidence[];
};

export type DispatchEvidenceStage = "en_almacen" | "en_preparacion" | "cargado" | "en_transito" | "entregado";

export type DispatchEvidence = {
  id: string;
  etapa: DispatchEvidenceStage;
  descripcion: string;
  imageUrl: string;
};

export type DispatchLocation = {
  lat: number;
  lng: number;
  direccion: string;
};

export type DetectedClient = {
  id: string;
  nombreCliente: string;
  rif: string;
  ciudad: string;
  estado: string;
  contactoPrincipal: string;
  correo: string;
  estatusCuenta: string;
  despachos: number;
  origenDeteccion: string;
};

export const DISPATCH_STATUS_FLOW: DispatchStatus[] = [
  "en_almacen",
  "en_preparacion",
  "cargado",
  "en_transito",
  "entregado",
];

export const EVIDENCE_STAGE_DEFAULT_IMAGE: Record<DispatchEvidenceStage, string> = {
  en_almacen: EVIDENCIA_ALMACEN,
  en_preparacion: EVIDENCIA_PREPARACION,
  cargado: EVIDENCIA_CARGADO,
  en_transito: EVIDENCIA_CARGADO,
  entregado: EVIDENCIA_ENTREGADO,
};

function normalizeDate(date: string | undefined) {
  return (date || "").slice(0, 10);
}

function hashString(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function inferStatus(seed: string): DispatchStatus {
  const idx = hashString(seed) % DISPATCH_STATUS_FLOW.length;
  return DISPATCH_STATUS_FLOW[idx];
}

function compareByDateDesc(a: ResultDocument, b: ResultDocument) {
  const da = normalizeDate(a.fechaEmision || a.studyDate || a.date);
  const db = normalizeDate(b.fechaEmision || b.studyDate || b.date);
  return db.localeCompare(da);
}

const geoByCity: Array<{ key: string; lat: number; lng: number; direccion: string }> = [
  { key: "caracas", lat: 10.4806, lng: -66.9036, direccion: "Centro logístico G3, Caracas" },
  { key: "guarenas", lat: 10.4703, lng: -66.6168, direccion: "Centro de distribución Guarenas, Miranda" },
  { key: "barquisimeto", lat: 10.0739, lng: -69.3228, direccion: "Punto de entrega Barquisimeto, Lara" },
  { key: "maracay", lat: 10.2469, lng: -67.5958, direccion: "Hub de entregas Maracay, Aragua" },
  { key: "los teques", lat: 10.3446, lng: -67.0433, direccion: "Zona de entrega Los Teques, Miranda" },
  { key: "farmatodo cedis maracay", lat: 10.2418, lng: -67.6018, direccion: "CEDIS Farmatodo Maracay, Aragua" },
  { key: "puerto cabello", lat: 10.4731, lng: -68.0125, direccion: "Puerto Cabello, Carabobo" },
];

function resolveLocation(origen: string, destino: string, seed: string): DispatchLocation {
  const lowerDestino = destino.toLowerCase();
  const lowerOrigen = origen.toLowerCase();
  const match = geoByCity.find((item) => lowerDestino.includes(item.key))
    || geoByCity.find((item) => lowerOrigen.includes(item.key))
    || geoByCity[hashString(seed) % geoByCity.length];

  const offset = (hashString(seed) % 8) / 1000;
  return {
    lat: Number((match.lat + offset).toFixed(6)),
    lng: Number((match.lng - offset).toFixed(6)),
    direccion: match.direccion,
  };
}

function buildEvidence(idDespacho: string, status: DispatchStatus, cliente: string): DispatchEvidence[] {
  const statusIndex = DISPATCH_STATUS_FLOW.indexOf(status);
  const items: DispatchEvidence[] = [];

  const evidenceByStage: Record<Exclude<DispatchEvidenceStage, "en_transito">, { descripcion: string; imageUrl: string }> = {
    en_almacen: {
      descripcion: `Mercancía paletizada en almacén para ${cliente}.`,
      imageUrl: EVIDENCIA_ALMACEN,
    },
    en_preparacion: {
      descripcion: "Operador preparando pallets y etiquetado para salida.",
      imageUrl: EVIDENCIA_PREPARACION,
    },
    cargado: {
      descripcion: `Mercancía cargada en camión, lista para salida de ruta para ${cliente}.`,
      imageUrl: EVIDENCIA_CARGADO,
    },
    entregado: {
      descripcion: "Mercancía descargada y entrega confirmada en destino.",
      imageUrl: EVIDENCIA_ENTREGADO,
    },
  };

  if (statusIndex >= DISPATCH_STATUS_FLOW.indexOf("en_almacen")) {
    const variant = evidenceByStage.en_almacen;
    items.push({
      id: `${idDespacho}-ev-almacen`,
      etapa: "en_almacen",
      descripcion: variant.descripcion,
      imageUrl: variant.imageUrl,
    });
  }

  if (statusIndex >= DISPATCH_STATUS_FLOW.indexOf("en_preparacion")) {
    const variant = evidenceByStage.en_preparacion;
    items.push({
      id: `${idDespacho}-ev-preparacion`,
      etapa: "en_preparacion",
      descripcion: variant.descripcion,
      imageUrl: variant.imageUrl,
    });
  }

  if (statusIndex >= DISPATCH_STATUS_FLOW.indexOf("cargado")) {
    const variant = evidenceByStage.cargado;
    items.push({
      id: `${idDespacho}-ev-cargado`,
      etapa: "cargado",
      descripcion: variant.descripcion,
      imageUrl: variant.imageUrl,
    });
  }

  // En transito no requiere evidencia visual para este flujo demo.

  if (statusIndex >= DISPATCH_STATUS_FLOW.indexOf("entregado")) {
    const variant = evidenceByStage.entregado;
    items.push({
      id: `${idDespacho}-ev-entregado`,
      etapa: "entregado",
      descripcion: variant.descripcion,
      imageUrl: variant.imageUrl,
    });
  }

  return items;
}

export function buildDispatches(documents: ResultDocument[]): DispatchRecord[] {
  const byClient = new Map<string, ResultDocument[]>();

  documents.forEach((doc) => {
    const key = doc.patientId || doc.patientDocument || doc.cliente;
    const current = byClient.get(key) || [];
    current.push(doc);
    byClient.set(key, current);
  });

  const result: DispatchRecord[] = [];

  byClient.forEach((docs, clientKey) => {
    const facturas = docs.filter((doc) => doc.documentType === "factura").sort(compareByDateDesc);
    const guias = docs.filter((doc) => doc.documentType === "guia").sort(compareByDateDesc);

    const maxLen = Math.max(facturas.length, guias.length);

    for (let i = 0; i < maxLen; i += 1) {
      const factura = facturas[i] || null;
      const guia = guias[i] || null;
      const base = guia || factura;
      if (!base) continue;

      const ref = (factura?.numeroFactura || guia?.numeroGuia || `${clientKey}-${i + 1}`).replace(/\s+/g, "");
      const idDespacho = `DSP-${ref.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`;

      const fecha = normalizeDate(
        guia?.fechaEmision || guia?.studyDate || guia?.date || factura?.fechaEmision || factura?.studyDate || factura?.date,
      );

      result.push({
        idDespacho,
        patientId: base.patientId,
        rif: base.patientDocument || "N/A",
        cliente: base.cliente,
        origen: guia?.origen || factura?.origen || "Centro logistico principal",
        destino: guia?.destino || factura?.destino || "Destino por confirmar",
        fecha,
        estatus: inferStatus(`${base.patientId}-${ref}-${fecha}`),
        facturaAsociada: factura?.numeroFactura || "Sin factura asociada",
        guiaAsociada: guia?.numeroGuia || "Sin guia asociada",
        facturaDoc: factura,
        guiaDoc: guia,
        ubicacion: resolveLocation(
          guia?.origen || factura?.origen || "Centro logistico principal",
          guia?.destino || factura?.destino || "Destino por confirmar",
          idDespacho,
        ),
        evidencias: [],
      });
    }
  });

  const sorted = result.sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Distribucion controlada para demo: garantiza presencia visual de todas las etapas cuando hay suficiente volumen.
  if (sorted.length >= DISPATCH_STATUS_FLOW.length) {
    const offset = hashString(sorted[0]?.idDespacho || "g3");
    return sorted.map((item, index) => {
      const estatus = DISPATCH_STATUS_FLOW[(index + offset) % DISPATCH_STATUS_FLOW.length];
      return {
        ...item,
        estatus,
        evidencias: buildEvidence(item.idDespacho, estatus, item.cliente),
      };
    });
  }

  return sorted.map((item) => ({
    ...item,
    evidencias: buildEvidence(item.idDespacho, item.estatus, item.cliente),
  }));
}

export function detectClientsFromDispatches(dispatches: DispatchRecord[]): DetectedClient[] {
  const byClient = new Map<string, DispatchRecord[]>();

  dispatches.forEach((dispatch) => {
    const key = dispatch.patientId || dispatch.rif || dispatch.cliente;
    const list = byClient.get(key) || [];
    list.push(dispatch);
    byClient.set(key, list);
  });

  return Array.from(byClient.entries()).map(([key, list]) => {
    const seed = list[0];
    const known = mockPatients.find((patient) => patient.id === key || patient.documentId === seed.rif);

    return {
      id: key,
      nombreCliente: known?.nombreCliente || known?.fullName || seed.cliente,
      rif: known?.rif || known?.documentId || seed.rif,
      ciudad: known?.ciudad || "Caracas",
      estado: known?.estado || "Distrito Capital",
      contactoPrincipal: known?.contactoPrincipal || "Contacto operativo",
      correo: known?.correo || known?.email || "operaciones@g3logistica.com",
      estatusCuenta: known?.estatusCuenta || "Activa",
      despachos: list.length,
      origenDeteccion: "Detectado automaticamente desde factura y guia de movilizacion",
    };
  }).sort((a, b) => a.nombreCliente.localeCompare(b.nombreCliente));
}

export function dispatchStatusLabel(status: DispatchStatus) {
  if (status === "en_almacen") return "En almacén";
  if (status === "en_preparacion") return "En preparación";
  if (status === "cargado") return "Cargado";
  if (status === "en_transito") return "En tránsito";
  return "Entregado";
}

export function dispatchStatusTone(status: DispatchStatus): "warning" | "success" | "bad" | "default" {
  if (status === "entregado") return "success";
  if (status === "en_transito" || status === "cargado") return "default";
  return "warning";
}

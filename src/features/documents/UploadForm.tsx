import { FormEvent, useState } from "react";
import { Patient, ResultCategory } from "@/app/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useResultsStore } from "@/features/results/useResultsStore";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { saveDocumentMetadata } from "@/services/amplify/apiAdapter";
import { getStorageStatusMessage, uploadDocument } from "@/services/amplify/storageAdapter";

type Props = {
  patient: Patient | undefined;
  actor: string;
};

const categories: ResultCategory[] = ["Factura", "GuiaMovilizacion"];

export function UploadForm({ patient, actor }: Props) {
  const [category, setCategory] = useState<ResultCategory>("Factura");
  const [studyName, setStudyName] = useState("");
  const [studyDate, setStudyDate] = useState("");
  const [site, setSite] = useState(patient?.site || "");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const addDocument = useResultsStore((s) => s.addDocument);
  const addAudit = useAuditStore((s) => s.addEvent);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!patient || !file || !studyName || !studyDate) {
      setStatus("Completa cliente, documento, fecha y archivo.");
      return;
    }

    const isFactura = category === "Factura";
    const serial = `AUTO-${Date.now().toString().slice(-6)}`;

    const newDoc = await uploadDocument({
      file,
      document: {
        patientId: patient.id,
        category,
        studyName,
        studyDate,
        site: site || patient.site,
        status: "nuevo",
        fileName: file.name,
        fileType: file.type.includes("image") ? "image" : "pdf",
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        documentType: isFactura ? "factura" : "guia",
        tipoDocumento: isFactura ? "Factura" : "Guia de movilizacion",
        numeroFactura: isFactura ? `FT-${serial}` : undefined,
        numeroGuia: isFactura ? undefined : `GM-${serial}`,
        cliente: patient.fullName,
        fechaEmision: studyDate,
        origen: site || patient.site,
        destino: "Pendiente de asignacion",
      },
    });

    addDocument(newDoc);
    await saveDocumentMetadata(newDoc);
    addAudit("upload", actor, `Documento logistico cargado: ${newDoc.studyName}`);

    setStatus("Documento cargado y metadata guardada (modo demostracion).");
    setStudyName("");
    setStudyDate("");
    setTags("");
    setFile(null);
  };

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold">Cargar documento logistico</h3>
      <p className="mb-4 text-xs text-slate-500">{getStorageStatusMessage()}</p>

      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="text-sm">
          Categoria
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResultCategory)}
            className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option === "Factura" ? "Factura" : "Guia de movilizacion"}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Nombre del documento
          <Input
            placeholder="Ej. Factura de despacho febrero"
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
          />
        </label>

        <label className="text-sm">
          Fecha de emision
          <Input type="date" value={studyDate} onChange={(e) => setStudyDate(e.target.value)} />
        </label>

        <label className="text-sm">
          Sede
          <Input value={site} onChange={(e) => setSite(e.target.value)} />
        </label>

        <label className="text-sm">
          Etiquetas opcionales
          <Input placeholder="facturacion, despacho nacional" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>

        <label className="text-sm">
          Archivo (PDF/JPG/PNG)
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <Button type="submit" className="w-full">
          Guardar documento
        </Button>
      </form>

      {status ? <Alert className="mt-3">{status}</Alert> : null}
    </Card>
  );
}

import { ClinicalDocument } from "@/app/types";

export const mockClinicalDocuments: ClinicalDocument[] = [
  {
    id: "cd-1",
    patientId: "p-001",
    title: "Informe complementario de laboratorio",
    documentType: "informe",
    date: "2026-02-21",
    summary: "Interpretación clínica preliminar de panel metabólico.",
    fileUrl: "/sample-docs/example-result.pdf",
  },
  {
    id: "cd-2",
    patientId: "p-001",
    title: "Indicaciones técnicas para próxima toma",
    documentType: "indicacion",
    date: "2026-02-26",
    summary: "Ayuno de 10 horas y suspensión de suplementos 24h antes.",
    fileUrl: "/sample-docs/example-result.pdf",
  },
  {
    id: "cd-3",
    patientId: "p-001",
    title: "Recomendaciones post examen",
    documentType: "recomendacion",
    date: "2026-02-26",
    summary: "Mantener hidratación y seguimiento con médico tratante.",
    fileUrl: "/sample-docs/example-result.pdf",
  },
];

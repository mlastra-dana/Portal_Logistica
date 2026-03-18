import { create } from "zustand";
import { ResultDocument } from "@/app/types";
import { mockDocuments } from "@/mocks/documents";

export type DocumentFilters = {
  documentId?: string;
  query?: string;
  type?: "all" | "pdf" | "image";
  service?: string;
  from?: string;
  to?: string;
};

type ResultsState = {
  documents: ResultDocument[];
  addDocument: (doc: ResultDocument) => void;
  markAsViewed: (id: string) => void;
  getDocumentsForPatient: (patientId: string, filters?: DocumentFilters) => ResultDocument[];
};

export const useResultsStore = create<ResultsState>((set, get) => ({
  documents: mockDocuments,
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  markAsViewed: (id) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, status: "consultado" } : doc,
      ),
    })),
  getDocumentsForPatient: (patientId, filters) => {
    const query = (filters?.query || "").trim().toLowerCase();
    const type = filters?.type || "all";
    const service = filters?.service || "all";
    const from = filters?.from || "";
    const to = filters?.to || "";
    const documentId = (filters?.documentId || "").trim().toUpperCase();

    const resolveService = (category: ResultDocument["category"], explicit?: string) => explicit || category;

    return get()
      .documents
      .filter((doc) => doc.patientId === patientId || (documentId && (doc.patientDocument || "").toUpperCase() === documentId))
      .filter((doc) => {
        const date = (doc.date || doc.studyDate || "").slice(0, 10);
        const title = (doc.title || doc.studyName || "").toLowerCase();
        const fileName = (doc.fileName || "").toLowerCase();
        const numberRef = `${doc.numeroFactura || ""} ${doc.numeroGuia || ""}`.toLowerCase();
        const docType = doc.type || doc.fileType;
        const docService = resolveService(doc.category, doc.service);

        if (query && !title.includes(query) && !fileName.includes(query) && !numberRef.includes(query)) return false;
        if (type !== "all" && docType !== type) return false;
        if (service !== "all" && docService !== service) return false;
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.date || a.studyDate || "";
        const dateB = b.date || b.studyDate || "";
        return dateB.localeCompare(dateA);
      });
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@/app/types";
import { useAuditStore } from "@/features/audit/useAuditStore";

export type DemoPatientSession = {
  role: "cliente";
  patientId: string;
  documentId: string;
  startedAt: string;
};

type DemoRoleState = {
  role: Role;
  rolePickerOpen: boolean;
  tokenAccessBanner: string | null;
  patientSession: DemoPatientSession | null;
  adminSelectedClientId: string | null;
  setRole: (role: Role) => void;
  openRolePicker: () => void;
  closeRolePicker: () => void;
  setTokenAccessBanner: (value: string | null) => void;
  setPatientSession: (session: DemoPatientSession) => void;
  setAdminSelectedClientId: (clientId: string | null) => void;
  clearPatientSession: () => void;
  resetCompanySession: () => void;
};

export const useDemoRoleStore = create<DemoRoleState>()(
  persist(
    (set, get) => ({
      role: "cliente",
      rolePickerOpen: false,
      tokenAccessBanner: null,
      patientSession: null,
      adminSelectedClientId: null,
      setRole: (role) => {
        const prev = get().role;
        set({ role, rolePickerOpen: false });
        useAuditStore
          .getState()
          .addEvent("role_changed", "demo-user", `Perfil cambiado de ${prev} a ${role}`);
      },
      openRolePicker: () => set({ rolePickerOpen: true }),
      closeRolePicker: () => set({ rolePickerOpen: false }),
      setTokenAccessBanner: (value) => set({ tokenAccessBanner: value }),
      setAdminSelectedClientId: (clientId) => set({ adminSelectedClientId: clientId }),
      setPatientSession: (session) => {
        const prevRole = get().role;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("g3-logistica-demo-session", JSON.stringify(session));
        }
        set({ role: "cliente", patientSession: session, rolePickerOpen: false });
        useAuditStore
          .getState()
          .addEvent("role_changed", "demo-user", `Perfil cambiado de ${prevRole} a cliente`);
      },
      clearPatientSession: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("g3-logistica-demo-session");
        }
        set({ patientSession: null, rolePickerOpen: false });
        useAuditStore.getState().addEvent("role_changed", "demo-user", "Sesión de cliente finalizada");
      },
      resetCompanySession: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("g3-logistica-demo-session");
          window.localStorage.removeItem("demo_shared_docs");
          window.localStorage.removeItem("selected-industry");
          window.localStorage.removeItem("multi-industry-session");
        }
        set({
          role: "cliente",
          patientSession: null,
          tokenAccessBanner: null,
          rolePickerOpen: false,
          adminSelectedClientId: null,
        });
        useAuditStore.getState().addEvent("role_changed", "demo-user", "Salida del portal G3");
      },
    }),
    { name: "g3-logistica-demo-role" },
  ),
);

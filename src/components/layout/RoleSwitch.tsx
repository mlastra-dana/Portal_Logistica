import { Role } from "@/app/types";
import { Button } from "@/components/ui/Button";
import { useCompanySession } from "@/features/demo/useCompanySession";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";

const roles: Role[] = ["cliente", "usuario"];

const roleLabel: Record<Role, string> = {
  cliente: "Perfil Cliente",
  usuario: "Perfil Usuario",
};

export function RoleSwitch({ compact = true }: { compact?: boolean }) {
  const { exitToSelector } = useCompanySession();
  const { role, patientSession, setRole, rolePickerOpen, openRolePicker, closeRolePicker } = useDemoRoleStore();
  const label = roleLabel[role];

  return (
    <div className="relative">
      <Button variant="ghost" className="rounded-md border-brand-primary/20 text-xs font-semibold text-brand-ink" onClick={openRolePicker}>
        {label}
      </Button>

      {(rolePickerOpen || !compact) && (
        <div className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-brand-border bg-white p-2 shadow-soft">
          {role === "cliente" && patientSession ? (
            <p className="mb-1 rounded-md bg-brand-surface px-3 py-2 text-xs text-brand-muted">Cliente activo: {patientSession.documentId}</p>
          ) : null}
          {roles.map((item) => (
            <button
              key={item}
              onClick={() => setRole(item)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${role === item ? "bg-brand-primary text-white" : "hover:bg-brand-surface"}`}
            >
              {roleLabel[item]}
            </button>
          ))}
          <button
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-xs text-brand-muted hover:bg-brand-surface"
            onClick={exitToSelector}
          >
            Salir
          </button>
          <button className="mt-1 w-full rounded-md px-3 py-2 text-xs text-brand-muted hover:bg-brand-surface" onClick={closeRolePicker}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

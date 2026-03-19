import { ReactNode, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useCompanySession } from "@/features/demo/useCompanySession";

type Item = { to: string; label: string };

type Props = {
  title: string;
  items: Item[];
  children: ReactNode;
};

export function AuthedLayout({ title, items, children }: Props) {
  const location = useLocation();
  const addEvent = useAuditStore((s) => s.addEvent);
  const { exitToSelector } = useCompanySession();

  useEffect(() => {
    addEvent("page_view", "demo-user", `Navegacion a ${location.pathname}`);
  }, [location.pathname, addEvent]);

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="md:flex">
        <aside className="w-full border-r border-brand-ink/20 bg-brand-ink p-4 text-white md:flex md:min-h-screen md:w-64 md:flex-col">
          <nav className="no-scrollbar flex gap-2 overflow-x-auto md:block md:space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block whitespace-nowrap rounded-xl px-3 py-2 text-sm ${isActive ? "bg-brand-primary text-white" : "text-white/80 hover:bg-brand-ink2"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-3">
                  <BrandMark compact />
                </div>
                <p className="text-xs text-brand-muted">Portal G3 Logistica / {location.pathname}</p>
                <p className="text-sm font-medium">{title}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-brand-border px-3 py-2 text-xs font-semibold text-brand-ink">
                  Perfil Administrador
                </span>
                <Button variant="ghost" className="text-xs" onClick={exitToSelector}>
                  Salir
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-3 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

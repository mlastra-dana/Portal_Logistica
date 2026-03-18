import { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";
import { useCompanySession } from "@/features/demo/useCompanySession";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { exitToSelector } = useCompanySession();

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <BrandMark compact />
          </div>
          <nav className="hidden items-center gap-6 text-sm text-brand-muted md:flex">
            <a href="#operacion">Operacion</a>
            <a href="#documentos">Documentos</a>
            <a href="#seguimiento">Seguimiento</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <Button variant="ghost" onClick={exitToSelector}>Salir</Button>
        </div>
      </header>

      <main>{children}</main>

      <section className="mt-16 bg-brand-ink py-12 text-white" id="contacto">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4">
          <BrandMark className="brightness-0 invert" />
          <p className="text-sm text-white/75">Gestion documental logistica para operaciones B2B</p>
        </div>
      </section>
    </div>
  );
}

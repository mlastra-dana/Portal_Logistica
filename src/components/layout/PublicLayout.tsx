import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useCompanySession } from "@/features/demo/useCompanySession";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { exitToSelector } = useCompanySession();

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/brand/perfilab/logo.png"
              alt="Perfilab"
              className="h-9 w-auto max-w-[180px] object-contain sm:max-w-[220px]"
            />
          </div>
          <nav className="hidden items-center gap-6 text-sm text-brand-muted md:flex">
            <a href="#nosotros">Nosotros</a>
            <a href="#servicios">Servicios</a>
            <a href="#blog">Blog</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <Button variant="ghost" onClick={exitToSelector}>Salir</Button>
        </div>
      </header>

      <main>{children}</main>

      <section className="mt-16 bg-brand-ink py-12 text-white" id="contacto">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4">
          <img src="/brand/perfilab/logo.png" alt="Perfilab" className="h-8 w-auto object-contain" />
          <p className="text-lg font-semibold">Perfilab</p>
          <p className="text-sm text-white/75">Resultados y documentos médicos en línea</p>
        </div>
      </section>
    </div>
  );
}

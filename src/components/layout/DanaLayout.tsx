import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/Button";
import { useCompanySession } from "@/features/demo/useCompanySession";

const danaButtonPrimary = "rounded-md border border-brand-primary bg-brand-primary text-white shadow-none";

type Props = {
  children: ReactNode;
};

export function DanaLayout({ children }: Props) {
  const { exitToSelector } = useCompanySession();

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#2d3138]">
      <header className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/access" aria-label="Ir al acceso del portal G3 Logistica">
            <BrandMark compact />
          </Link>
          <Button className={danaButtonPrimary} onClick={exitToSelector}>
            Salir
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

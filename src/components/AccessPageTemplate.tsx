import { FormEventHandler } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useCompanySession } from "@/features/demo/useCompanySession";

type Props = {
  userUsername: string;
  userPassword: string;
  onUserUsernameChange: (value: string) => void;
  onUserPasswordChange: (value: string) => void;
  onUserSubmit: FormEventHandler<HTMLFormElement>;
  userError?: string;
  clientUsername: string;
  clientPassword: string;
  onClientUsernameChange: (value: string) => void;
  onClientPasswordChange: (value: string) => void;
  onClientSubmit: FormEventHandler<HTMLFormElement>;
  clientError?: string;
};

const fieldClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const actionButton = "rounded-md !border-brand-primary !bg-brand-primary !text-white shadow-none";

export function AccessPageTemplate({
  userUsername,
  userPassword,
  onUserUsernameChange,
  onUserPasswordChange,
  onUserSubmit,
  userError,
  clientUsername,
  clientPassword,
  onClientUsernameChange,
  onClientPasswordChange,
  onClientSubmit,
  clientError,
}: Props) {
  const { exitToSelector } = useCompanySession();

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/access" aria-label="Ir al acceso del portal G3 Logistica">
            <BrandMark compact />
          </Link>
          <nav className="hidden items-center gap-8 text-base text-brand-ink lg:flex">
            <a className="text-brand-accent" href="#">INICIO</a>
            <a href="#">SERVICIOS</a>
            <a href="#">NUESTRA EMPRESA</a>
            <a href="#">CONTACTO</a>
          </nav>
          <Button className={actionButton} onClick={exitToSelector}>
            Salir
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <Card className="rounded-xl border-brand-border bg-white p-6 shadow-none md:p-8">
          <div className="mb-6 border-l-4 border-brand-primary pl-4">
            <h1 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Portal G3 Logistica</h1>
            <p className="mt-2 text-sm text-brand-muted">Gestion documental logistica para facturas y guias de movilizacion.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form className="rounded-lg border border-brand-border bg-brand-surface p-4" onSubmit={onUserSubmit}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Perfil Usuario</p>
              <p className="mt-2 text-sm text-brand-muted">Acceso operativo interno para el equipo G3.</p>

              <div className="mt-3">
                <Label htmlFor="user-username">Usuario</Label>
                <Input
                  id="user-username"
                  value={userUsername}
                  onChange={(event) => onUserUsernameChange(event.target.value)}
                  placeholder="usuario.g3"
                  className={fieldClass}
                  required
                />
              </div>

              <div className="mt-3">
                <Label htmlFor="user-password">Clave</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={userPassword}
                  onChange={(event) => onUserPasswordChange(event.target.value)}
                  placeholder="********"
                  className={fieldClass}
                  required
                />
              </div>

              {userError ? <Alert variant="warn" className="mt-3">{userError}</Alert> : null}

              <Button type="submit" className={`mt-3 w-full ${actionButton}`}>
                Entrar a Portal Interno
              </Button>

              <div className="mt-4 rounded-md border border-brand-border bg-white p-3 text-xs text-brand-muted">
                <p className="font-semibold text-brand-text">Credenciales demo Perfil Usuario</p>
                <p>- usuario.g3 / demo123</p>
                <p>- operaciones.g3 / demo123</p>
              </div>
            </form>

            <form className="rounded-lg border border-brand-border bg-white p-4" onSubmit={onClientSubmit}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Perfil Cliente</p>
              <p className="mt-2 text-sm text-brand-muted">Consulta documentos de cliente.</p>

              <div className="mt-3">
                <Label htmlFor="client-username">Usuario</Label>
                <Input
                  id="client-username"
                  value={clientUsername}
                  onChange={(event) => onClientUsernameChange(event.target.value)}
                  placeholder="cliente.polar"
                  className={fieldClass}
                  required
                />
              </div>

              <div className="mt-3">
                <Label htmlFor="client-password">Clave</Label>
                <Input
                  id="client-password"
                  type="password"
                  value={clientPassword}
                  onChange={(event) => onClientPasswordChange(event.target.value)}
                  placeholder="********"
                  className={fieldClass}
                  required
                />
              </div>

              {clientError ? <Alert variant="warn" className="mt-3">{clientError}</Alert> : null}

              <Button type="submit" className={`mt-3 w-full ${actionButton}`}>
                Entrar como Perfil Cliente
              </Button>

              <div className="mt-4 rounded-md border border-brand-border bg-brand-surface p-3 text-xs text-brand-muted">
                <p className="font-semibold text-brand-text">Credenciales demo Perfil Cliente</p>
                <p>- cliente.polar / demo123</p>
                <p>- cliente.farmatodo / demo123</p>
              </div>
            </form>
          </div>
        </Card>
      </section>
    </div>
  );
}

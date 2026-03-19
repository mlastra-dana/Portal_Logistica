import { FormEventHandler, useState } from "react";
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
}: Props) {
  const { exitToSelector } = useCompanySession();
  const [showUserPassword, setShowUserPassword] = useState(false);

  const eyeIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
      <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a21.4 21.4 0 0 1-5.1 5.8" />
      <path d="M6.6 6.6A21.1 21.1 0 0 0 1 12s4 7 11 7c1.4 0 2.7-.3 3.9-.8" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/access" aria-label="Ir al acceso del portal G3 Logistica">
            <BrandMark compact />
          </Link>
          <Button className={actionButton} onClick={exitToSelector}>
            Salir
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <Card className="rounded-xl border-brand-border bg-white p-6 shadow-none md:p-8">
          <div className="mb-6 border-l-4 border-brand-primary pl-4">
            <h1 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Portal G3 Logistica</h1>
            <p className="mt-2 text-sm text-brand-muted">Operacion de almacen y distribucion con seguimiento de despachos.</p>
          </div>

          <form className="rounded-lg border border-brand-border bg-brand-surface p-4" onSubmit={onUserSubmit}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Perfil Administrador</p>
            <p className="mt-2 text-sm text-brand-muted">Acceso interno administrativo para seguimiento de despachos G3.</p>

            <div className="mt-3">
              <Label htmlFor="user-username">Usuario administrador</Label>
              <Input
                id="user-username"
                value={userUsername}
                onChange={(event) => onUserUsernameChange(event.target.value)}
                placeholder="administrador.g3"
                className={fieldClass}
                required
              />
            </div>

            <div className="mt-3">
              <Label htmlFor="user-password">Clave</Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showUserPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(event) => onUserPasswordChange(event.target.value)}
                  placeholder="********"
                  className={`${fieldClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 my-auto text-brand-muted hover:text-brand-ink"
                  onClick={() => setShowUserPassword((v) => !v)}
                  aria-label={showUserPassword ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showUserPassword ? eyeOffIcon : eyeIcon}
                </button>
              </div>
            </div>

            {userError ? <Alert variant="warn" className="mt-3">{userError}</Alert> : null}

            <Button type="submit" className={`mt-3 w-full ${actionButton}`}>
              Entrar
            </Button>

            <div className="mt-4 rounded-md border border-brand-border bg-white p-3 text-xs text-brand-muted">
              <p className="font-semibold text-brand-text">Credenciales demo Administrador</p>
              <p>- administrador.g3 / demo123</p>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

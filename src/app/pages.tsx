import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AccessPageTemplate } from "@/components/AccessPageTemplate";
import { BrandMark } from "@/components/BrandMark";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuditStore } from "@/features/audit/useAuditStore";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";
import { mockPatients } from "@/mocks/patients";
import { validateDemoToken } from "@/services/mock/tokenValidator";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-surface text-brand-text md:flex md:flex-col">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-4 md:px-8">
          <BrandMark compact />
          <nav className="hidden items-center gap-8 text-[1rem] font-medium tracking-[0.02em] text-brand-ink md:flex">
            <a className="text-brand-accent" href="#inicio">INICIO</a>
            <a href="#servicios">SERVICIOS</a>
            <a href="#empresa">NUESTRA EMPRESA</a>
            <a href="#contacto">CONTACTO</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <section className="w-full px-0">
          <div className="g3-hero relative overflow-hidden px-6 py-16 md:px-12 md:py-24">
            <div className="g3-grid absolute inset-0 opacity-25" />
            <div className="relative mx-auto max-w-[1120px]">
              <h1 className="max-w-[700px] text-4xl font-black leading-[1.05] text-white md:text-7xl">
                Gestion documental
              </h1>
              <p className="mt-4 max-w-[620px] text-xl text-white/90">
                Plataforma digital para facturas y guias de movilizacion con control operativo en tiempo real.
              </p>
              <Link to="/access" className="mt-6 inline-block">
                <Button className="px-8 py-4 text-xl font-bold uppercase !bg-brand-accent !text-white">Acceder</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function AccessPage() {
  const navigate = useNavigate();
  const setRole = useDemoRoleStore((s) => s.setRole);
  const setAdminSelectedClientId = useDemoRoleStore((s) => s.setAdminSelectedClientId);
  const setPatientSession = useDemoRoleStore((s) => s.setPatientSession);
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [clientRif, setClientRif] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientError, setClientError] = useState("");

  const onUserSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const u = userUsername.trim().toLowerCase();
    const p = userPassword.trim();

    const validUserCreds: Record<string, "usuario"> = {
      "administrador.g3": "usuario",
    };

    const matchedRole = validUserCreds[u];
    if (!matchedRole || p !== "demo123") {
      setUserError("Credenciales invalidas para Perfil Administrador.");
      return;
    }

    setUserError("");
    setRole(matchedRole);
    setAdminSelectedClientId(mockPatients[0]?.id || null);
    navigate("/portal/usuario", { replace: true });
  };

  const onClientSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rif = clientRif.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const p = clientPassword.trim();

    if (!rif || p !== "demo123") {
      setClientError("Credenciales invalidas para Perfil Cliente.");
      return;
    }

    const patient = mockPatients.find((item) =>
      item.documentId.toUpperCase().replace(/[^A-Z0-9]/g, "") === rif,
    );
    if (!patient) {
      setClientError("No se pudo abrir la sesion del cliente.");
      return;
    }

    setClientError("");
    setPatientSession({
      role: "cliente",
      patientId: patient.id,
      documentId: patient.documentId,
      startedAt: new Date().toISOString(),
    });
    navigate("/portal/cliente", { replace: true });
  };

  return (
    <AccessPageTemplate
      userUsername={userUsername}
      userPassword={userPassword}
      onUserUsernameChange={setUserUsername}
      onUserPasswordChange={setUserPassword}
      onUserSubmit={onUserSubmit}
      userError={userError}
      clientRif={clientRif}
      clientPassword={clientPassword}
      onClientRifChange={setClientRif}
      onClientPasswordChange={setClientPassword}
      onClientSubmit={onClientSubmit}
      clientError={clientError}
    />
  );
}

export function LoginPage() {
  return <Navigate to="/access" replace />;
}

export function TokenAccessPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const setBanner = useDemoRoleStore((s) => s.setTokenAccessBanner);
  const addEvent = useAuditStore((s) => s.addEvent);

  useEffect(() => {
    const result = validateDemoToken(token);
    if (!result.valid) return;

    setBanner(`Acceso por enlace temporal. Expira: ${result.expiresAt}`);
    addEvent("page_view", "demo-user", `Ingreso por token ${token}`);
    navigate(`/portal/cliente?token=${encodeURIComponent(token)}`, { replace: true });
  }, [token, setBanner, navigate, addEvent]);

  const validation = validateDemoToken(token);
  if (validation.valid) return null;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card>
          <h1 className="text-2xl font-bold">Enlace no valido o expirado</h1>
          <Alert variant="warn" className="mt-3">
            Este acceso temporal no esta disponible. Solicita un nuevo enlace.
          </Alert>
          <Link to="/access" className="mt-4 inline-block">
            <Button>Volver al acceso</Button>
          </Link>
        </Card>
      </div>
    </PublicLayout>
  );
}

export function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card>
          <h1 className="text-2xl font-bold">404</h1>
          <p className="mt-2 text-brand-muted">La pagina no existe en Portal G3 Logistica.</p>
          <Link to="/access" className="mt-4 inline-block">
            <Button>Volver al acceso</Button>
          </Link>
        </Card>
      </div>
    </PublicLayout>
  );
}

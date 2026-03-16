import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AccessPageTemplate } from "@/components/AccessPageTemplate";
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
    <div className="min-h-screen bg-[#f1f3f5] text-[#2d3138] md:flex md:flex-col">
      <header className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-5">
            <img src="/brand/perfilab/logo.png" alt="Perfilab" className="h-14 w-auto object-contain" />
          </div>
          <nav className="hidden items-center gap-5 text-sm font-semibold tracking-[0.06em] text-[#2f3947] md:flex">
            <a href="#">NOSOTROS</a>
            <span className="text-brand-primary">|</span>
            <a href="#">SERVICIOS</a>
            <span className="text-brand-primary">|</span>
            <a href="#">BLOG</a>
            <span className="text-brand-primary">|</span>
            <a href="#">CONTACTO</a>
          </nav>
          <div className="hidden md:block">
            <div className="rounded-pill bg-brand-primary px-7 py-3 text-[1rem] font-bold text-white">
              ☎ 0212.819.47.50
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <section className="mx-auto max-w-[1120px] px-3 pb-5 pt-3 md:px-4 md:pb-6">
          <div className="perfilab-hero relative overflow-hidden rounded-[1.6rem] md:rounded-[2rem]">
          <div className="perfilab-hex absolute inset-0 opacity-40" />
          <div className="perfilab-ekg absolute inset-x-0 bottom-0 h-[56%] opacity-35" />
          <div className="relative px-5 py-7 md:px-9 md:py-9">
            <h1 className="max-w-[660px] text-[1.95rem] font-extrabold leading-[1.07] text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.40)] md:text-[3.8rem]">
              Visual/descarga de resultados medicos
            </h1>
            <p className="mt-3.5 max-w-[560px] text-[1rem] font-medium leading-snug text-white/90 md:text-[1.25rem]">
              Consulta, descarga y comparte tus resultados de forma segura.
            </p>
            <Link to="/access" className="mt-5 inline-block">
              <Button className="rounded-pill !border-brand-primary !bg-brand-primary px-6 py-2 text-base font-semibold !text-white shadow-[0_10px_24px_-12px_rgba(247,147,30,0.9)] md:px-7 md:py-2.5 md:text-lg">
                Ingresar
              </Button>
            </Link>
          </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto bg-white">
        <div className="mx-auto max-w-[1440px] px-3 pb-8 md:px-4">
          <div className="border-t border-[#e2e7ee] px-6 py-8 md:px-10 md:py-10">
            <div className="flex justify-center">
              <img src="/brand/perfilab/logo.png" alt="Perfilab" className="h-16 w-auto object-contain opacity-90" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AccessPage() {
  const navigate = useNavigate();
  const setPatientSession = useDemoRoleStore((s) => s.setPatientSession);
  const [documentId, setDocumentId] = useState("");
  const [error, setError] = useState("");
  const labDemoIds = ["V-16004539", "V-12000001", "V-12000002", "V-12000003"];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedDoc = documentId.trim().toUpperCase();
    const patient = mockPatients.find((item) => item.documentId.toUpperCase() === normalizedDoc);

    if (!patient) {
      setError("No hay resultados para esta cédula.");
      return;
    }

    setError("");
    setPatientSession({
      role: "patient",
      patientId: patient.id,
      documentId: patient.documentId,
      startedAt: new Date().toISOString(),
    });
    navigate("/results/labs", { replace: true });
  };

  return (
    <AccessPageTemplate
      industryName="Servicios médicos"
      documentId={documentId}
      onDocumentIdChange={setDocumentId}
      onSubmit={onSubmit}
      demoIds={labDemoIds}
      error={error}
    />
  );
}

export function LoginPage() {
  return <Navigate to="/results/overview" replace />;
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
    navigate(`/results/labs?token=${encodeURIComponent(token)}`, { replace: true });
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
          <p className="mt-2 text-brand-muted">La pagina no existe en el portal de documentos.</p>
          <Link to="/access" className="mt-4 inline-block">
            <Button>Volver al acceso</Button>
          </Link>
        </Card>
      </div>
    </PublicLayout>
  );
}

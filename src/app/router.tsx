import { createBrowserRouter, Navigate } from "react-router-dom";
import { AccessPage, LandingPage, LoginPage, NotFoundPage, TokenAccessPage } from "@/app/pages";
import { AdminPatientsPage, AdminUploadPage, AdminUploadsPage } from "@/features/admin/pages";
import {
  PatientClinicalDocumentsPage,
  PatientMedicalResultsPage,
  PatientOrdersExamsPage,
  PatientOverviewPage,
  PatientShareResultsPage,
} from "@/features/patient/pages";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/multi", element: <Navigate to="/" replace /> },
  { path: "/landing", element: <LandingPage /> },
  { path: "/access", element: <AccessPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/r/:token", element: <TokenAccessPage /> },
  { path: "/portal/cliente", element: <PatientMedicalResultsPage /> },
  { path: "/portal/cliente/despachos", element: <PatientOverviewPage /> },
  { path: "/portal/cliente/documentos", element: <Navigate to="/portal/cliente/despachos" replace /> },
  { path: "/portal/usuario", element: <Navigate to="/portal/usuario/dashboard" replace /> },
  { path: "/portal/usuario/dashboard", element: <AdminPatientsPage /> },
  { path: "/portal/usuario/despachos", element: <AdminUploadsPage /> },
  { path: "/portal/usuario/documentos", element: <Navigate to="/portal/usuario/despachos" replace /> },
  { path: "/portal/usuario/cargar", element: <AdminUploadPage /> },
  { path: "/portal/usuario/cliente", element: <Navigate to="/portal/usuario/despachos" replace /> },
  { path: "/portal/usuario/actividad", element: <Navigate to="/portal/usuario/dashboard" replace /> },
  { path: "/results", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/results/overview", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/results/labs", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/results/orders", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/results/clinical-docs", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/results/share", element: <Navigate to="/portal/cliente" replace /> },
  { path: "/admin", element: <Navigate to="/portal/usuario" replace /> },
  { path: "/admin/patients", element: <Navigate to="/portal/usuario/dashboard" replace /> },
  { path: "/admin/uploads", element: <Navigate to="/portal/usuario/despachos" replace /> },
  { path: "/admin/audit", element: <Navigate to="/portal/usuario/dashboard" replace /> },
  { path: "*", element: <NotFoundPage /> },
]);

# Portal G3 Logistica

Portal frontend demo para gestion documental logistica, construido sobre React + Vite + TypeScript + Tailwind.

## Que hace el portal

El sistema esta orientado a dos perfiles:

- `Perfil Usuario` (interno G3): vista operativa con acceso global a clientes, facturas y guias de movilizacion.
- `Perfil Cliente` (externo): vista de consulta de su cuenta, sus facturas y sus guias de movilizacion.

Tipos documentales soportados:

- Facturas
- Guias de movilizacion

## Credenciales demo

Perfil Usuario:

- `usuario.g3 / demo123`
- `operaciones.g3 / demo123`

Perfil Cliente (RIF sin guiones + clave):

- `J401200019 / demo123`
- `J401200027 / demo123`

## Caracteristicas principales

- Login mock para ambos perfiles
- Dashboard operativo (Perfil Usuario)
- Modulo de clientes con cuentas enterprise demo (Empresas Polar, Farmatodo)
- Dashboard de consulta (Perfil Cliente)
- Listados y detalle documental de facturas y guias
- Datos mock coherentes para presentacion
- Sin backend ni integraciones API

## Rutas principales

- `/` landing
- `/access` acceso / login
- `/portal/usuario/dashboard` resumen operativo interno
- `/portal/usuario/documentos` consulta documental interna
- `/portal/cliente` consulta documental de cliente
- `/r/:token` acceso temporal mock

## Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

## Notas tecnicas

- Proyecto frontend-only, listo para hosting estatico (AWS Amplify).
- Persistencia de sesion y rol en estado local.
- No incluye autenticacion real, backend ni WhatsApp.

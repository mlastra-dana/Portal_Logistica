# Portal G3 Logistica

Demo frontend en React + Vite + TypeScript + Tailwind para gestion documental logistica.

El portal esta orientado a dos perfiles:

- `Perfil Usuario`: vista operativa con acceso global
- `Perfil Cliente`: vista simplificada con acceso a sus propios documentos

Documentos soportados en el demo:

- Facturas
- Guias de movilizacion

## Alcance

- Frontend only (sin backend productivo)
- Datos mock para presentacion
- Navegacion y estados de perfil simulados
- Compatible con despliegue estatico en AWS Amplify

## Rutas principales

- `/` landing del portal
- `/access` acceso con seleccion de perfil
- `/portal/cliente` dashboard de cliente
- `/portal/usuario/dashboard` resumen operativo
- `/portal/usuario/documentos` consulta global
- `/portal/usuario/actividad` bitacora demo
- `/r/:token` acceso temporal mock

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

## Notas

- El cambio de perfil se maneja en estado local (`zustand` persistente).
- No hay integracion real de autenticacion, API ni WhatsApp.
- La carga de documentos se mantiene en modo demostracion con persistencia mock.

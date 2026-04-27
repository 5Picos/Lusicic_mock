# FlotaTrack — Sistema de mantenimiento de flota

Aplicación web para el seguimiento de mantenimientos preventivos de flotas de transporte. Permite visualizar el estado de cada vehículo, registrar servicios realizados y anticipar vencimientos por kilómetros o por tiempo.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- npm (incluido con Node.js)

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/5Picos/Lusicic_mock.git
cd flota-mantenimiento
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilación para producción |
| `npm start` | Ejecuta la build de producción |
| `npm run lint` | Análisis estático del código |

## Stack tecnológico

- **Next.js 16** con App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** — componentes de interfaz
- **Lucide React** — íconos

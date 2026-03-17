# Copilot Instructions for Numerano Site

This document outlines the architecture, workflows, and conventions for the Numerano Site repository to help AI coding agents be productive.

## Architecture & Big Picture Context

This repository is structured as a monorepo with the following major components:

- **Frontend (`/src`, root `package.json`)**: A React application built with TypeScript and Vite. It heavily focuses on rich 3D animations and scrolling experiences (located in `/src/components/ScrollExperience/` and 3D shapes in `/src/components/components/shape*.tsx`). Tailwind CSS is used for styling.
- **Backend (`/server`)**: A Node.js/Express server written in TypeScript. It provides APIs for:
  - **BrainBuff (`/server/models/BrainBuff.ts`, `/server/controllers/brainBuffController.ts`)**: A weekly math/logic challenge generator powered by Google's Gemini API (specifically `gemini-2.5-flash`), with cron scheduling (`/server/cron/scheduler.ts`).
  - **Feedback System**: Collects user feedback storing it in MongoDB.

### Data Flow

- Frontend interfaces with the backend via API endpoints (configuration in `src/config/api.ts`).
- Backend uses Mongoose for MongoDB data mapping and interfaces with Gemini (`server/services/geminiService.ts`) for dynamic question generation.

## Critical Developer Workflows

- **Environment Setup**: Requires `server/.env` containing valid MongoDB connection strings and `GEMINI_API_KEY` for BrainBuff features.
- **Docker (Recommended)**: The application is designed to be run via Docker Compose (`docker-compose up --build`), serving the frontend at `http://localhost:5173` and backend at `http://localhost:8000`.
- **Local Development**:
  - Run the Backend: `cd server && npm install && npm run dev`
  - Run the Frontend: `npm install && npm run dev` (from the repository root).
- **Scripts**: Maintenance scripts exist in the `/scripts/` directory (e.g., `update-members.ts`, `test-xlsx.ts`), primarily for managing team data (`src/data/teamData.ts`).

## Conventions & Patterns

- **UI Animations & 3D Shapes**:
  - React components for raw 3D shapes or complex CSS animations are kept in `src/components/components/`.
  - Complex scroll-based animations are isolated in `src/components/ScrollExperience/`. Ensure you check these places before adding duplicate animation logic.
  - Instead of standard text rendering, some components like `NUMERANO.tsx` achieve visual effects by assembling images of individual letters iteratively using timeouts and `requestAnimationFrame`.
- **TypeScript & Typing**:
  - Both frontend and backend share strong typing patterns, but avoid circular dependencies between `src/` and `server/`. Frontend models are often kept in `src/types/`.
- **Backend Modularization**: Endpoints strictly follow the `routes` -> `controllers` -> `services` -> `models` layering. For instance, any new AI generation functionality should go to `server/services/geminiService.ts` rather than living directly inside controllers.

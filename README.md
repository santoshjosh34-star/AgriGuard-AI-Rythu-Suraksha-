# AgriGuard AI — Every Farmer Deserves an AI Team

Autonomous multi-agent agricultural operations and **Kisan Rakshak** disaster-readiness platform built for Indian farmers (Homingo Hack Days Problem Statement A3: *A personal staff for everyone*).

## Core Architecture

1. **Master Orchestrator Agent (`src/server/orchestrator.ts`)**
   - Uses `@google/genai` (`gemini-4-hydrogen`) with real `FunctionDeclaration` multi-turn tool calling on the server side (`GEMINI_API_KEY` never leaves the server).
   - Routes farmer requests to the appropriate specialised agents, logs every tool invocation (`AgentExecutionStep`), cross-checks findings for conflicts, explicitly discloses uncertainty and missing data, and synthesizes one unified action plan in **English**, **Hindi (हिन्दी)**, or **Telugu (తెలుగు)**.

2. **Six Specialised AI Agents (`src/server/agentTools.ts`)**
   - **Weather Intelligence Agent**: Analyses rainfall, wind, temperature, and forecast uncertainty; separates confirmed observations from forecasts without fabricating live weather data.
   - **Crop Intelligence Agent**: Evaluates crop type, location, growth stage, soil moisture, and visible symptoms cautiously.
   - **Kisan Rakshak Agent (`src/lib/kisanRakshakEngine.ts`)**: Deterministic hazard scoring engine producing `Low`, `Moderate`, `High`, and `Critical` risk levels, weighted factor breakdowns, confidence percentages, missing-data disclosures, before/during/after-event action plans, checklists, and verified Indian emergency helplines (`112`, `1078`, `1800-180-1551`, `1070 / 1077`).
   - **Farm Advisory Agent**: Separates general agronomic guidance from advice requiring local KVK/expert confirmation.
   - **Voice and Language Agent (`src/components/VoiceControls.tsx`)**: Supports Telugu, Hindi, and English interface translation plus browser Web Speech voice input and spoken summary output where supported.
   - **Action and Alert Agent**: Prioritises actionable alerts with explicit reasons, completion tracking, and human-in-the-loop confirmation dialogs before consequential farm actions.

3. **Three Repeatable Synthetic Test Scenarios (`src/lib/demoScenarios.ts`)**
   - **Scenario 1**: Heavy rainfall warning for a paddy farmer (East Godavari alluvial basin).
   - **Scenario 2**: Cyclone approaching a coastal farming region (Konaseema coast).
   - **Scenario 3**: Waterlogging and flood risk affecting agricultural land (Khammam black cotton basin).
   - All synthetic test data is explicitly labelled and never presented as live disaster warnings.

## Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Configure server-side environment secret
# Set GEMINI_API_KEY in your environment or .env file

# 3. Run unit tests for Kisan Rakshak risk engine & validation
npx --yes tsx --test src/lib/kisanRakshakEngine.test.ts

# 4. Start development server (Express + Vite on port 3000)
npm run dev

# 5. Typecheck and production build
npm run lint
npm run build
npm start
```

# ConfigForm Devtools Vite Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@moluoxixi/config-form-devtools-vite-plugin` as the first devtools package: development-only `defineField` source metadata injection plus a Vite dev-server IDE open endpoint.

**Architecture:** Add a focused workspace package under `packages/ConfigFormDevtoolsVitePlugin`. The package exports a Vite plugin plus pure helpers for AST source injection and open-in-editor command handling. Runtime overlay and `FormField` performance bridge remain out of scope for this package phase.

**Tech Stack:** TypeScript, Vite plugin API, Vitest, `@babel/parser`, `@vue/compiler-sfc`, `magic-string`, pnpm workspace.

---

## Tasks

### Task 1: Package Scaffold And Red Tests

**Files:**
- Create: `packages/ConfigFormDevtoolsVitePlugin/package.json`
- Create: `packages/ConfigFormDevtoolsVitePlugin/index.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/vite.config.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tsconfig.base.json`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tsconfig.app.json`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tsconfig.test.json`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tests/sourceInject.test.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tests/plugin.test.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/tests/openInEditor.test.ts`

- [ ] **Step 1: Add package metadata and test files**

Create a package named `@moluoxixi/config-form-devtools-vite-plugin` with `build`, `test`, `test:coverage`, and `typecheck` scripts. Add tests that import `../src/sourceInject`, `../src/index`, and `../src/openInEditor`.

- [ ] **Step 2: Install workspace dependencies**

Run: `pnpm install`

- [ ] **Step 3: Run red tests**

Run: `pnpm -C packages/ConfigFormDevtoolsVitePlugin test`

Expected: fail because `src/sourceInject`, `src/index`, and `src/openInEditor` do not exist yet.

### Task 2: Source Injection Core

**Files:**
- Create: `packages/ConfigFormDevtoolsVitePlugin/src/sourceInject.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/src/types.ts`

- [ ] **Step 1: Implement `transformDefineFieldSource()`**

Parse TypeScript and Vue SFC script blocks, collect imported `defineField` local names from `@moluoxixi/config-form`, find object literal calls, and inject `__source` with `id`, `file`, `line`, and `column`.

- [ ] **Step 2: Enforce visible failures**

Throw `ConfigFormDevtoolsPluginError` if parsing fails, if a target object already has `__source`, or if source location is unavailable.

- [ ] **Step 3: Run source injection tests**

Run: `pnpm -C packages/ConfigFormDevtoolsVitePlugin exec vitest run tests/sourceInject.test.ts`

Expected: source injection tests pass.

### Task 3: Vite Plugin And Open Endpoint

**Files:**
- Create: `packages/ConfigFormDevtoolsVitePlugin/src/index.ts`
- Create: `packages/ConfigFormDevtoolsVitePlugin/src/openInEditor.ts`

- [ ] **Step 1: Implement `configFormDevtools()`**

Export a Vite plugin with `name`, `enforce: 'pre'`, `apply: 'serve'`, `transform()`, and `configureServer()`.

- [ ] **Step 2: Implement open-in-editor helpers**

Validate POST payloads, restrict files to Vite root or configured allow roots, construct editor command args, and return explicit HTTP errors for invalid requests.

- [ ] **Step 3: Run plugin and middleware tests**

Run: `pnpm -C packages/ConfigFormDevtoolsVitePlugin exec vitest run tests/plugin.test.ts tests/openInEditor.test.ts`

Expected: plugin and middleware tests pass.

### Task 4: Exports, Docs, And Workspace Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-02-config-form-devtools-design.md`

- [ ] **Step 1: Update docs with the final package name**

Use `@moluoxixi/config-form-devtools-vite-plugin` in package lists and examples.

- [ ] **Step 2: Run package checks**

Run:

```bash
pnpm -C packages/ConfigFormDevtoolsVitePlugin typecheck
pnpm -C packages/ConfigFormDevtoolsVitePlugin test
pnpm -C packages/ConfigFormDevtoolsVitePlugin test:coverage
pnpm -C packages/ConfigFormDevtoolsVitePlugin build
```

Expected: all pass.

- [ ] **Step 3: Run full quality gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

Expected: all pass. Coverage thresholds must remain at or above the project configuration.

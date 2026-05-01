# Plugin DIY Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a strict runtime-first extension boundary so ConfigForm can support DIY component registries, i18n tokens, safe expressions, debug traces, and future low-code adapters with pure field configs as the public input.

**Architecture:** `defineField` returns plain `FieldConfig`; the old public `FieldDef` runtime model is removed from the core path. Runtime normalizes fields, resolves values, conditions, components, and slots before Vue renders them. `ConfigForm` owns runtime creation, `useForm` consumes runtime for visibility/disabled checks, and `FormField` consumes resolved fields for rendering.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Vitest, Vue Test Utils, Zod.

---

## Task 1: Runtime Contracts And Unit Tests

**Files:**
- Create: `packages/ConfigForm/src/runtime/types.ts`
- Create: `packages/ConfigForm/src/runtime/createFormRuntime.ts`
- Create: `packages/ConfigForm/src/runtime/index.ts`
- Test: `packages/ConfigForm/tests/runtime.test.ts`

- [x] **Step 1: Write failing tests**

Tests cover component registry resolution, i18n token resolution, safe expression conditions, extension priority ordering, strict duplicate extension conflict handling, unresolved component errors, and debug trace events.

- [x] **Step 2: Run runtime tests**

Run: `pnpm -C packages/ConfigForm exec vitest run tests/runtime.test.ts`
Expected: fail because runtime files are not implemented yet.

- [x] **Step 3: Implement runtime**

Create a pure runtime with `createFormRuntime(options)`, `i18n(key, fallback, params)`, `expr(expression, fallback)`, `resolveField`, `resolveValue`, `resolveVisible`, `resolveDisabled`, extension sorting, strict registry merging, and debug event emission.

- [x] **Step 4: Run runtime tests**

Run: `pnpm -C packages/ConfigForm exec vitest run tests/runtime.test.ts`
Expected: pass.

## Task 2: Runtime Injection And Form Integration

**Files:**
- Create: `packages/ConfigForm/src/composables/useRuntime.ts`
- Modify: `packages/ConfigForm/src/index.vue`
- Modify: `packages/ConfigForm/src/components/FormField/src/index.vue`
- Modify: `packages/ConfigForm/src/composables/useForm.ts`
- Test: `packages/ConfigForm/tests/components.test.ts`
- Test: `packages/ConfigForm/tests/useForm.test.ts`

- [x] **Step 1: Write failing component/composable tests**

Tests cover `runtime` prop on `ConfigForm`, string component lookup, i18n labels/placeholders, expression-powered visibility/disabled, nested slot field resolution, and function predicate support inside the runtime condition pipeline.

- [x] **Step 2: Run integration tests**

Run: `pnpm -C packages/ConfigForm exec vitest run tests/components.test.ts tests/useForm.test.ts`
Expected: fail before integration.

- [x] **Step 3: Implement integration**

Add runtime prop to public types, provide/inject runtime, resolve top-level fields in `ConfigForm`, pass runtime context into `FormField`, and let `useForm` use runtime condition resolution for maps, validation skip checks, and submit output filtering. Keep `FormField` typed against resolved fields only.

- [x] **Step 4: Run integration tests**

Run: `pnpm -C packages/ConfigForm exec vitest run tests/components.test.ts tests/useForm.test.ts`
Expected: pass.

## Task 3: Public Exports, Docs, And Verification

**Files:**
- Modify: `packages/ConfigForm/index.ts`
- Modify: `packages/ConfigForm/src/types/index.ts`
- Modify: `packages/ConfigForm/README.md`
- Modify: `README.md`

- [x] **Step 1: Export runtime APIs and types**

Export runtime helpers and public types so external users can build their own extensions.

- [x] **Step 2: Add documentation**

Document minimal DIY runtime usage: component registry, i18n token, expression visibility, extension conflict strategy, and debug trace.

- [x] **Step 3: Run package verification**

Run: `pnpm -C packages/ConfigForm typecheck`, `pnpm -C packages/ConfigForm test`, `pnpm -C packages/ConfigForm test:coverage`, `pnpm -C packages/ConfigForm build`.
Expected: all pass.

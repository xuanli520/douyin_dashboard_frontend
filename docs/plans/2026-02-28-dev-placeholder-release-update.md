# Dev Placeholder Release Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update dev placeholders to show 2026-03-10 and wire TaskSchedulePage to EndpointStatusWrapper with real `/api/v1/schedules` call.

**Architecture:** Rely on existing endpoint meta + wrapper flow. Change expectedRelease constants, add a simple schedulesApi, and wrap TaskSchedulePage with useQuery + EndpointStatusWrapper.

**Tech Stack:** Next.js / React, TypeScript, TanStack Query, custom httpClient.

---

### Task 1: Update endpoint expected release dates

**Files:**
- Modify: `src/config/endpoint-meta.ts`
- Modify: `README.md`

**Step 1: Update all development endpoints expectedRelease to `2026-03-10`.**  
**Step 2: Sync README mock response example `expected_release` to `2026-03-10`.**  
**Step 3: (Optional) Quick search to ensure no stray `2026-03-01` remains: `rg \"2026-03-01\"`.**

### Task 2: Add schedules API client

**Files:**
- Create: `src/features/schedules/services/schedulesApi.ts`

**Step 1: Implement `getList` using `httpClient.get` with `API_ENDPOINTS.SCHEDULES_LIST`.**  
**Step 2: Export typed `Promise<ApiResponse<Record<string, unknown>>>` matching other services.**

### Task 3: Wire TaskSchedulePage to endpoint status flow

**Files:**
- Modify: `src/app/components/TaskSchedulePage.tsx`

**Step 1: Import `useQuery`, `EndpointStatusWrapper`, `API_ENDPOINTS`, and new `schedulesApi`; choose `ClipboardList` icon.**  
**Step 2: Add `useQuery` call for schedules list; pass `responseData={query.data}` and `path={API_ENDPOINTS.SCHEDULES_LIST}` to `EndpointStatusWrapper`.**  
**Step 3: Wrap existing page JSX with `EndpointStatusWrapper`; keep current UI inside wrapper; add `placeholderProps={{ icon: <ClipboardList ... /> }}`.**

### Task 4: Sanity check

**Files/Commands:**
- Run (optional if time): `npm run lint`  
- Manual: start dev server `npm run dev`, visit data-analysis/reports/risk-alert/task-schedule; verify dev placeholder shows “预计 2026-03-10 发布” and toast/Badge match when endpoint is dev.

### Task 5: Commit

**Step 1: `git status` to review changes.`  
**Step 2: `git add src/config/endpoint-meta.ts README.md src/features/schedules/services/schedulesApi.ts src/app/components/TaskSchedulePage.tsx docs/plans/*.md`**  
**Step 3: `git commit -m \"chore: update dev placeholder release date and schedule status\"`**

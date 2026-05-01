# 🤖 RULES FOR CODING AGENTS (SYSTEM INTEGRITY PROTOCOL)

You are maintaining a **Deterministic Financial Execution ERP** for travel agencies. To prevent regressions and maintain the system's "Master" status, you **MUST** follow these non-negotiable laws.

## 1. The Event-Driven Law
- **NO DIRECT DATABASE MUTATIONS**: You must never write to `system_state`, `quotes`, or `bookings` directly from the frontend or a simple API route.
- **MANDATORY LOOP**: All mutations must follow: `Mutation Request` → `eventService.emitEvent()` → `Logic Engine` → `State Update`.
- **APPEND-ONLY LOG**: The `events` table is the only authoritative history. Never delete or edit an event.

## 2. Tenant Isolation (RLS Security)
- **RLS IS SACRED**: Every table has Row Level Security (RLS) enabled. Never disable it.
- **TENANT_ID ENFORCEMENT**: Every query must include a `tenant_id` check. Policies are based on `auth.jwt() ->> 'tenant_id'`.
- **NO DATA LEAKS**: Before saving any change, verify that the `tenant_id` matches the current session context.

## 3. State Machine Integrity
- **DETERMINISTIC TRANSITIONS**: State changes (e.g., `QUOTED` → `LOCKED` → `PAID`) must be validated. You cannot skip states.
- **LOCKING RULE**: Once a record enters a "Locked" or "Confirmed" state, it becomes immutable. To change it, you must create a new version and emit a superseding event.

## 4. Audit Hash Chaining
- **CHAIN INTEGRITY**: Every mutation must generate a `current_hash` based on the `previous_hash` of the last audit log for that tenant.
- **FORENSIC AUDIT**: If a hash chain is broken, the system must trigger a `RED_ALERT` and freeze the state.

## 5. UI/UX Terminology (Business Language)
- **NO ENGINEERING JARGON**: The user never sees "Events", "State Machine", "Edge Functions", or "RLS".
- **BUSINESS MAPPING**:
    - Use "Activity Feed" instead of "Event Logs".
    - Use "Review Inbox" instead of "Approvals Queue".
    - Use "Business Rules" instead of "Policy Engine".
    - Use "Emergency Stop" instead of "Kill Switch".
- **SIMPLICITY FIRST**: If a feature adds system complexity but doesn't simplify the agency's business problem, reject it.

## 6. Regression Testing
- **SCHEMA PROTECTION**: Before modifying the database, verify that existing API routes and Services will not break. Always add, never subtract, from the core schema.
- **ENVIRONMENT VARIABLES**: Never hardcode keys. Use `lib/supabase.ts` which handles the server/browser safety logic.

---
**FAILURE TO FOLLOW THESE RULES IS AN ARCHITECTURAL BREACH.**
Every commit must leave the system cleaner, more consistent, and fully compliant with the Master Architecture Document.

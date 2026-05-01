# TRAVEL-SASS System Specifications

## 1. Core Database Tables (Truth Layer)

| Table | Purpose | Key Columns | Governance Rule |
| :--- | :--- | :--- | :--- |
| `tenants` | Multi-tenant isolation | `id`, `name`, `plan_type` | Immutable tenant ID on all child records. |
| `org_config` | System Constitution | `commission_rules`, `kill_switch_active` | Single source of truth for decision logic. |
| `system_state` | Inventory Master | `service_id`, `state`, `data` | No direct mutation; versioned transitions only. |
| `approvals` | Secretary Gateway | `raw_data`, `ai_data`, `confidence` | Human-in-the-loop required for data entry. |
| `events` | Audit Trail (ELK) | `type`, `payload`, `processed` | Immutable history of all system intent. |
| `quotes` | Financial Commitment | `total_price`, `margin`, `snapshot` | Financial state locked at moment of creation. |
| `audit_logs` | Forensic History | `action`, `before`, `after` | Record of every state change for compliance. |

## 2. Event Types (Communication Layer)

| Event Code | Trigger Source | Action Result |
| :--- | :--- | :--- |
| `RAW_IMPORT_CREATED` | Ingestion Page | Populate Secretary Queue |
| `IMPORT_APPROVED` | Secretary | Promote to System State (Inventory) |
| `QUOTE_CREATED` | Consultant | Generate financial snapshot |
| `KILL_SWITCH_TRIGGERED`| Admin | Freeze all active quotes and states |
| `PRICE_CHANGED` | Partner API | Trigger re-evaluation of active quotes |

## 3. Financial Safety Thresholds

| Rule | Threshold | System Action |
| :--- | :--- | :--- |
| Never-Loss | Profit < 0 | Block Booking Confirmation |
| High Volatility | Change > 10% | Force Admin Re-approval |
| Expiry | 48 Hours | Soft-delete quote, require re-price |

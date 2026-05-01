import { EventType } from '@/constants/eventTypes';

export interface AppEvent {
  id: string;
  tenant_id: string;
  event_type: EventType;
  payload: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  snapshot: any;
  created_at: string;
}

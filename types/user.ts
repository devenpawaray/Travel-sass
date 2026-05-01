import { Role } from '@/constants/roles';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  settings_json: any;
  created_at: string;
}

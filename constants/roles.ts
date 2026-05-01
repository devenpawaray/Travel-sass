export const ROLES = {
  ADMIN: 'admin',
  CONSULTANT: 'consultant',
  SECRETARY: 'secretary',
  ACCOUNTANT: 'accountant'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

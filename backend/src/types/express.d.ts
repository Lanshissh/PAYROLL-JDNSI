import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      id?: string; // request id for tracing
      user?: User;

      // keep your existing auth context shape
      role?: string;
      companyId?: string;
      agencyId?: string | null;
      employeeId?: string | null;
    }
  }
}

export {};
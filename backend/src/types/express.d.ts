import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      role?: string;
      companyId?: string;
      agencyId?: string | null;
      employeeId?: string | null;
    }
  }
}

export {};

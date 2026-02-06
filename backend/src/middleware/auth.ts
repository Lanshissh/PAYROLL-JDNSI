import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  // 1️⃣ Verify token with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;

  // 2️⃣ Load role + scope from DB
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, company_id, agency_id, employee_id')
    .eq('user_id', data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'User profile not found' });
  }

  req.role = profile.role;
  req.companyId = profile.company_id;
  req.agencyId = profile.agency_id;
  req.employeeId = profile.employee_id;

  next();
}

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

/**
 * Permission-based access guard
 * Usage: requirePermission('payroll.lock')
 */
export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // requireAuth must run first
      if (!req.role) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }

      // Admin shortcut (optional but recommended)
      if (req.role === 'admin') {
        return next();
      }

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions!inner (
            key
          )
        `)
        .eq('role', req.role)
        .eq('permissions.key', permissionKey)
        .maybeSingle();

      if (error || !data) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      next();
    } catch (err) {
      console.error('permission middleware error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
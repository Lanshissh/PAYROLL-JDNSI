import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function normalizeAttendanceForDate(workDate: string) {
  const { data: punches, error } = await supabaseAdmin
    .from('attendance_logs')
    .select('employee_id, punch_time')
    .gte('punch_time', `${workDate} 00:00:00`)
    .lte('punch_time', `${workDate} 23:59:59`);

  if (error || !punches) {
    throw new Error('Failed to load attendance logs');
  }

  const byEmployee: Record<string, any[]> = {};
  for (const p of punches) {
    byEmployee[p.employee_id] ??= [];
    byEmployee[p.employee_id].push(p);
  }

  for (const employeeId of Object.keys(byEmployee)) {

    // 1️⃣ LEAVE CHECK — ABSOLUTE PRIORITY
    const { data: leave } = await supabaseAdmin
      .from('leave_requests')
      .select('is_paid')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')
      .lte('start_date', workDate)
      .gte('end_date', workDate)
      .maybeSingle();

    if (leave) {
      await supabaseAdmin.from('attendance_days').upsert({
        employee_id: employeeId,
        work_date: workDate,
        regular_minutes: leave.is_paid ? 480 : 0, // TODO: resolve from shift
        overtime_minutes: 0,
        night_diff_minutes: 0,
        holiday_minutes: 0,
        rest_day_minutes: 0,
        source: leave.is_paid ? 'leave' : 'unpaid_leave'
      }, {
        onConflict: 'employee_id,work_date'
      });

      continue; // 🚨 DO NOT PROCESS BIOMETRICS
    }

    // 2️⃣ BIOMETRIC ATTENDANCE (existing logic placeholder)
    const minutesWorked = 480; // TODO: compute from punches

    await supabaseAdmin.from('attendance_days').upsert({
      employee_id: employeeId,
      work_date: workDate,
      regular_minutes: minutesWorked,
      overtime_minutes: 0,
      night_diff_minutes: 0,
      holiday_minutes: 0,
      rest_day_minutes: 0,
      source: 'biometric'
    }, {
      onConflict: 'employee_id,work_date'
    });
  }
}
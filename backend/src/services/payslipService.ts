import { supabaseAdmin } from '../lib/supabaseAdmin';
import crypto from 'crypto';
import { buildPayslipPdf } from '../lib/pdf/payslipPdf';

type AttendancePayableRow = {
  employee_id: string;
  work_date: string;
  regular_minutes: number;
  overtime_minutes: number;
  night_diff_minutes: number;
  holiday_minutes: number;
  rest_day_minutes: number;
};

function isAttendancePayableRow(v: unknown): v is AttendancePayableRow {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.employee_id === 'string' &&
    typeof r.work_date === 'string' &&
    typeof r.regular_minutes === 'number' &&
    typeof r.overtime_minutes === 'number' &&
    typeof r.night_diff_minutes === 'number' &&
    typeof r.holiday_minutes === 'number' &&
    typeof r.rest_day_minutes === 'number'
  );
}

type EmployeeRow = {
  id: string;
  employee_code: string;
  full_name: string;
  agency_id: string;
};

function isEmployeeRow(v: unknown): v is EmployeeRow {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.employee_code === 'string' &&
    typeof r.full_name === 'string' &&
    typeof r.agency_id === 'string'
  );
}

type AgencyRow = { id: string; name: string };
function isAgencyRow(v: unknown): v is AgencyRow {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === 'string' && typeof r.name === 'string';
}

type PayrollRunRow = {
  status: string | null;
  company_id: string;
  period_start: string;
  period_end: string;
};

function isPayrollRunRow(v: unknown): v is PayrollRunRow {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    (typeof r.status === 'string' || r.status === null) &&
    typeof r.company_id === 'string' &&
    typeof r.period_start === 'string' &&
    typeof r.period_end === 'string'
  );
}

type CompanyRow = { id: string; name: string };
function isCompanyRow(v: unknown): v is CompanyRow {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === 'string' && typeof r.name === 'string';
}

type PayslipInput = {
  payrollRunId: string;
  generatedBy: string;
};

export async function generatePayslip({
  payrollRunId,
  generatedBy
}: PayslipInput) {
  // 1️⃣ Ensure payroll is locked
  const { data: payrollRaw } = await supabaseAdmin
    .from('payroll_runs')
    .select('status, company_id, period_start, period_end')
    .eq('id', payrollRunId)
    .single();

  if (!isPayrollRunRow(payrollRaw)) {
    throw new Error('Payroll run not found');
  }

  const payroll = payrollRaw;

  if (!payroll || payroll.status !== 'locked') {
    throw new Error('Payslips can only be generated for locked payroll');
  }

  // 1b️⃣ Fetch company name for header
  const { data: companyRaw } = await supabaseAdmin
    .from('companies')
    .select('id, name')
    .eq('id', payroll.company_id)
    .single();

  if (!isCompanyRow(companyRaw)) {
    throw new Error('Company not found for payroll run');
  }

  // 2️⃣ Get payroll attendance snapshot
  const { data: payablesRaw } = await supabaseAdmin
    .from('attendance_payables')
    .select('*')
    .eq('payroll_run_id', payrollRunId);

  const payables = (payablesRaw ?? []).filter(isAttendancePayableRow);

  if (payables.length === 0) {
    throw new Error('No attendance snapshot found');
  }

  // 2b️⃣ Aggregate minutes per employee (one payslip per employee)
  const byEmployee = new Map<
    string,
    {
      regular: number;
      overtime: number;
      nightDiff: number;
      holiday: number;
      restDay: number;
    }
  >();

  for (const row of payables) {
    const existing = byEmployee.get(row.employee_id) ?? {
      regular: 0,
      overtime: 0,
      nightDiff: 0,
      holiday: 0,
      restDay: 0
    };
    existing.regular += row.regular_minutes;
    existing.overtime += row.overtime_minutes;
    existing.nightDiff += row.night_diff_minutes;
    existing.holiday += row.holiday_minutes;
    existing.restDay += row.rest_day_minutes;
    byEmployee.set(row.employee_id, existing);
  }

  let count = 0;
  const generatedAt = new Date();

  for (const [employeeId, minutes] of byEmployee.entries()) {
    // 3️⃣ Fetch employee + agency display data
    const { data: employeeRaw } = await supabaseAdmin
      .from('employees')
      .select('id, employee_code, full_name, agency_id')
      .eq('id', employeeId)
      .single();

    if (!isEmployeeRow(employeeRaw)) {
      // If an employee record is missing, skip generating a broken payslip.
      // (You may want to alert/track this via audit logs later.)
      continue;
    }

    const { data: agencyRaw } = await supabaseAdmin
      .from('agencies')
      .select('id, name')
      .eq('id', employeeRaw.agency_id)
      .single();

    const agencyName = isAgencyRow(agencyRaw) ? agencyRaw.name : undefined;

    // 4️⃣ Generate styled PDF buffer
    const pdfBuffer = await buildPayslipPdf({
      companyName: companyRaw.name,
      periodStart: payroll.period_start,
      periodEnd: payroll.period_end,
      employeeCode: employeeRaw.employee_code,
      employeeName: employeeRaw.full_name,
      agencyName,
      minutes,
      generatedAt
    });

    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // 5️⃣ Store document metadata (file storage later)
    await supabaseAdmin.from('documents').insert({
      type: 'payslip',
      payroll_run_id: payrollRunId,
      employee_id: employeeId,
      hash,
      created_by: generatedBy
    });

    count++;
  }

  return { count };
}
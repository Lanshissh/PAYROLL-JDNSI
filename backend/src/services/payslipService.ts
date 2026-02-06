import { supabaseAdmin } from '../lib/supabaseAdmin';
import crypto from 'crypto';

type PayslipInput = {
  payrollRunId: string;
  generatedBy: string;
};

export async function generatePayslip({
  payrollRunId,
  generatedBy
}: PayslipInput) {
  // 1️⃣ Ensure payroll is locked
  const { data: payroll } = await supabaseAdmin
    .from('payroll_runs')
    .select('status')
    .eq('id', payrollRunId)
    .single();

  if (!payroll || payroll.status !== 'locked') {
    throw new Error('Payslips can only be generated for locked payroll');
  }

  // 2️⃣ Get payroll attendance snapshot
  const { data: payables } = await supabaseAdmin
    .from('attendance_payables')
    .select('*')
    .eq('payroll_run_id', payrollRunId);

  if (!payables || payables.length === 0) {
    throw new Error('No attendance snapshot found');
  }

  let count = 0;

  for (const row of payables) {
    // 3️⃣ Fake PDF generation (replace later)
    const pdfBuffer = Buffer.from(
      `Payslip\nEmployee: ${row.employee_id}\nDate: ${row.work_date}`,
      'utf-8'
    );

    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // 4️⃣ Store document metadata (file storage later)
    await supabaseAdmin.from('documents').insert({
      type: 'payslip',
      payroll_run_id: payrollRunId,
      employee_id: row.employee_id,
      hash,
      created_by: generatedBy
    });

    count++;
  }

  return { count };
}
import { useEffect, useState } from 'react';
import { getPayrollForApproval, lockPayroll, releasePayslips } from '../../api/payroll';
import { useAuth } from '../../auth/AuthContext';

export default function PayrollLockPage() {
  const { role } = useAuth();
  const [runs, setRuns] = useState<any[]>([]);

  async function load() {
    const data = await getPayrollForApproval();
    setRuns(data ?? []);
  }

  async function handleLock(id: string) {
    await lockPayroll(id);
    load();
  }

  async function handleRelease(id: string) {
    await releasePayslips(id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (role !== 'finance') {
    return <p>Not authorized</p>;
  }

  return (
    <div>
      <h2>Lock Payroll & Release Payslips</h2>

      <table>
        <thead>
          <tr>
            <th>Period</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(r => (
            <tr key={r.id}>
              <td>{r.period_start} → {r.period_end}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'finance_approved' && (
                  <button onClick={() => handleLock(r.id)}>
                    Lock Payroll
                  </button>
                )}

                {r.status === 'locked' && (
                  <button onClick={() => handleRelease(r.id)}>
                    Release Payslips
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
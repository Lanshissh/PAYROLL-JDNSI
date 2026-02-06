import { useEffect, useState } from 'react';
import {
  getPayrollForApproval,
  acknowledgePayroll,
  approvePayroll
} from '../../api/payroll';
import { useAuth } from '../../auth/AuthContext';
import { usePendingMap } from '../../hooks/usePendingMap';
import { notify } from '../../components/common/toast';

type PayrollRun = {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  is_sandbox: boolean;
};

export default function PayrollApprovalPage() {
  const { role } = useAuth();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  const { isPending, run } = usePendingMap<string>();

  async function load() {
    setLoading(true);
    const data = await getPayrollForApproval();
    setRuns(data ?? []);
    setLoading(false);
  }

  async function handleAcknowledge(id: string) {
    try {
      await acknowledgePayroll(id);
      await load();
      notify.success('Acknowledged');
    } catch {
      notify.error('Failed to acknowledge');
    }
  }

  async function handleApprove(id: string) {
    try {
      await approvePayroll(id);
      await load();
      notify.success('Approved');
    } catch {
      notify.error('Failed to approve');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function canAcknowledge(status: string) {
    return ['submitted', 'billing_approved', 'agency_approved'].includes(status);
  }

  function canApprove(status: string) {
    if (role === 'billing') return status === 'submitted';
    if (role === 'agency') return status === 'billing_approved';
    if (role === 'finance') return status === 'agency_approved';
    return false;
  }

  return (
    <div>
      <h2>Payroll Approvals</h2>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>
                  {r.period_start} → {r.period_end}
                </td>
                <td>{r.status}</td>
                <td>{r.is_sandbox ? 'Sandbox' : 'Real'}</td>
                <td>
                  {canAcknowledge(r.status) && (
                    <button
                      disabled={isPending(r.id)}
                      onClick={() =>
                        run(r.id, async () => {
                          await handleAcknowledge(r.id);
                        })
                      }
                    >
                      {isPending(r.id) ? 'Working…' : 'Acknowledge'}
                    </button>
                  )}

                  {canApprove(r.status) && (
                    <button
                      disabled={isPending(r.id)}
                      onClick={() =>
                        run(r.id, async () => {
                          await handleApprove(r.id);
                        })
                      }
                    >
                      {isPending(r.id) ? 'Working…' : 'Approve'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import {
  getPayrollForApproval,
  lockPayroll,
  releasePayslips
} from '../../api/payroll';
import { useAuth } from '../../auth/AuthContext';
import { usePendingMap } from '../../hooks/usePendingMap';

import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { notify } from '../../components/common/toast';

type PayrollRun = {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
};

export default function PayrollLockPage() {
  const { role } = useAuth();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  const { isPending, run } = usePendingMap<string>();

  const [confirm, setConfirm] = useState<null | {
    message: string;
    onConfirm: () => Promise<void>;
  }>(null);

  async function load() {
    setLoading(true);
    const data = await getPayrollForApproval();
    setRuns(data ?? []);
    setLoading(false);
  }

  async function handleLock(id: string) {
    try {
      await lockPayroll(id);
      notify.success('Payroll locked');
      await load();
    } catch {
      notify.error('Failed to lock payroll');
    }
  }

  async function handleRelease(id: string) {
    try {
      await releasePayslips(id);
      notify.success('Payslips released');
      await load();
    } catch {
      notify.error('Failed to release payslips');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (role !== 'finance') {
    return <p>Not authorized</p>;
  }

  const columns = [
    {
      header: 'Period',
      render: (r: PayrollRun) => `${r.period_start} → ${r.period_end}`
    },
    {
      header: 'Status',
      render: (r: PayrollRun) => r.status
    },
    {
      header: 'Actions',
      render: (r: PayrollRun) => (
        <>
          {r.status === 'finance_approved' && (
            <button
              disabled={isPending(`lock:${r.id}`)}
              onClick={() =>
                setConfirm({
                  message: 'Lock this payroll? This action cannot be undone.',
                  onConfirm: async () => {
                    await run(`lock:${r.id}`, async () => {
                      await handleLock(r.id);
                    });
                    setConfirm(null);
                  }
                })
              }
              style={{ marginRight: 8 }}
            >
              {isPending(`lock:${r.id}`) ? 'Locking…' : 'Lock Payroll'}
            </button>
          )}

          {r.status === 'locked' && (
            <button
              disabled={isPending(`release:${r.id}`)}
              onClick={() =>
                setConfirm({
                  message: 'Release payslips to employees?',
                  onConfirm: async () => {
                    await run(`release:${r.id}`, async () => {
                      await handleRelease(r.id);
                    });
                    setConfirm(null);
                  }
                })
              }
            >
              {isPending(`release:${r.id}`) ? 'Releasing…' : 'Release Payslips'}
            </button>
          )}
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Lock Payroll & Release Payslips</h2>

      <Card title="Payroll Actions">
        {loading && <LoadingState />}

        {!loading && runs.length === 0 && (
          <EmptyState message="No payroll runs ready for action." />
        )}

        {!loading && runs.length > 0 && <DataTable data={runs} columns={columns} />}
      </Card>

      <ConfirmDialog
        open={!!confirm}
        message={confirm?.message ?? ''}
        onConfirm={confirm?.onConfirm ?? (async () => {})}
        onCancel={() => setConfirm(null)}
        confirmText="Yes, proceed"
      />
    </div>
  );
}
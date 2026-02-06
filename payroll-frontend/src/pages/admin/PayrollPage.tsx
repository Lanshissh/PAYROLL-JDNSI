import { useEffect, useState } from 'react';
import { getPayrollRuns, createPayrollRun } from '../../api/payroll';

import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { notify } from '../../components/common/toast';

type PayrollRun = {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  is_sandbox: boolean;
};

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    period_start: '',
    period_end: '',
    is_sandbox: true
  });

  async function load() {
    setLoading(true);
    const data = await getPayrollRuns();
    setRuns(data ?? []);
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPayrollRun(form);
      notify.success(
        form.is_sandbox
          ? 'Sandbox payroll created'
          : 'Payroll run created'
      );
      setForm({ period_start: '', period_end: '', is_sandbox: true });
      load();
    } catch {
      notify.error('Failed to create payroll');
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* -----------------------------
     DataTable column definition
  ------------------------------ */

  const columns = [
    {
      header: 'Period',
      render: (r: PayrollRun) =>
        `${r.period_start} → ${r.period_end}`
    },
    {
      header: 'Status',
      render: (r: PayrollRun) => r.status
    },
    {
      header: 'Type',
      render: (r: PayrollRun) => (r.is_sandbox ? 'Sandbox' : 'Real')
    }
  ];

  return (
    <div>
      <h2>Payroll Runs</h2>

      {/* Create Payroll */}
      <Card title="Create Payroll Run">
        <form onSubmit={submit}>
          <input
            type="date"
            value={form.period_start}
            onChange={e =>
              setForm({ ...form, period_start: e.target.value })
            }
            required
          />

          <input
            type="date"
            value={form.period_end}
            onChange={e =>
              setForm({ ...form, period_end: e.target.value })
            }
            required
            style={{ marginLeft: 8 }}
          />

          <label style={{ marginLeft: 12 }}>
            <input
              type="checkbox"
              checked={form.is_sandbox}
              onChange={e =>
                setForm({ ...form, is_sandbox: e.target.checked })
              }
            />
            Sandbox
          </label>

          <button type="submit" style={{ marginLeft: 12 }}>
            Create Payroll
          </button>
        </form>
      </Card>

      {/* Payroll List */}
      <Card title="Payroll History">
        {loading && <LoadingState />}

        {!loading && runs.length === 0 && (
          <EmptyState message="No payroll runs found." />
        )}

        {!loading && runs.length > 0 && (
          <DataTable data={runs} columns={columns} />
        )}
      </Card>
    </div>
  );
}
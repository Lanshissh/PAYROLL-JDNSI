import { useEffect, useState } from 'react';
import { getPayrollRuns, createPayrollRun } from '../../api/payroll';

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
    await createPayrollRun(form);
    setForm({ period_start: '', period_end: '', is_sandbox: true });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Payroll Runs</h2>

      {/* Create payroll */}
      <form onSubmit={submit} style={{ marginBottom: 24 }}>
        <input
          type="date"
          value={form.period_start}
          onChange={e => setForm({ ...form, period_start: e.target.value })}
          required
        />

        <input
          type="date"
          value={form.period_end}
          onChange={e => setForm({ ...form, period_end: e.target.value })}
          required
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

      {/* Payroll list */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th>Type</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getMyLeaves, createLeave } from '../../api/leave';

type Leave = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  is_paid: boolean;
  status: string;
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: ''
  });

  async function load() {
    setLoading(true);
    const data = await getMyLeaves();
    setLeaves(data ?? []);
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createLeave(form);
    setForm({
      leave_type: 'vacation',
      start_date: '',
      end_date: '',
      reason: ''
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>My Leave Requests</h2>

      {/* New Leave */}
      <form onSubmit={submit} style={{ marginBottom: 24 }}>
        <select
          value={form.leave_type}
          onChange={e => setForm({ ...form, leave_type: e.target.value })}
        >
          <option value="vacation">Vacation</option>
          <option value="sick">Sick</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <input
          type="date"
          value={form.start_date}
          onChange={e => setForm({ ...form, start_date: e.target.value })}
          required
        />

        <input
          type="date"
          value={form.end_date}
          onChange={e => setForm({ ...form, end_date: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Reason (optional)"
          value={form.reason}
          onChange={e => setForm({ ...form, reason: e.target.value })}
        />

        <button type="submit">Submit Leave</button>
      </form>

      {/* Leave List */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td>{l.leave_type}</td>
                <td>{l.start_date}</td>
                <td>{l.end_date}</td>
                <td>{l.status}</td>
                <td>{l.is_paid ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
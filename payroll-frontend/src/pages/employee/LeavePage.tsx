import { useEffect, useState } from 'react';
import { getMyLeaves, createLeave } from '../../api/leave';

import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { notify } from '../../components/common/toast';

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
    try {
      await createLeave(form);
      notify.success('Leave request submitted');
      setForm({
        leave_type: 'vacation',
        start_date: '',
        end_date: '',
        reason: ''
      });
      load();
    } catch {
      notify.error('Failed to submit leave request');
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* -----------------------------
     DataTable columns
  ------------------------------ */

  const columns = [
    { header: 'Type', render: (l: Leave) => l.leave_type },
    { header: 'From', render: (l: Leave) => l.start_date },
    { header: 'To', render: (l: Leave) => l.end_date },
    { header: 'Status', render: (l: Leave) => l.status },
    {
      header: 'Paid',
      render: (l: Leave) => (l.is_paid ? 'Yes' : 'No')
    }
  ];

  return (
    <div>
      <h2>My Leave Requests</h2>

      {/* Submit Leave */}
      <Card title="Request Leave">
        <form onSubmit={submit}>
          <select
            value={form.leave_type}
            onChange={e =>
              setForm({ ...form, leave_type: e.target.value })
            }
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <input
            type="date"
            value={form.start_date}
            onChange={e =>
              setForm({ ...form, start_date: e.target.value })
            }
            required
            style={{ marginLeft: 8 }}
          />

          <input
            type="date"
            value={form.end_date}
            onChange={e =>
              setForm({ ...form, end_date: e.target.value })
            }
            required
            style={{ marginLeft: 8 }}
          />

          <input
            type="text"
            placeholder="Reason (optional)"
            value={form.reason}
            onChange={e =>
              setForm({ ...form, reason: e.target.value })
            }
            style={{ marginLeft: 8 }}
          />

          <button type="submit" style={{ marginLeft: 12 }}>
            Submit Leave
          </button>
        </form>
      </Card>

      {/* Leave History */}
      <Card title="Leave History">
        {loading && <LoadingState />}

        {!loading && leaves.length === 0 && (
          <EmptyState message="No leave requests found." />
        )}

        {!loading && leaves.length > 0 && (
          <DataTable data={leaves} columns={columns} />
        )}
      </Card>
    </div>
  );
}
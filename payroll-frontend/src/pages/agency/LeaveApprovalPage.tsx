import { useEffect, useState } from 'react';
import { getAgencyPendingLeaves, approveLeave } from '../../api/leave';

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getAgencyPendingLeaves();
    setLeaves(data ?? []);
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await approveLeave(id, action);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Pending Leave Requests</h2>

      {loading ? (
        <p>Loading…</p>
      ) : leaves.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td>{l.employees?.full_name}</td>
                <td>{l.leave_type}</td>
                <td>{l.start_date}</td>
                <td>{l.end_date}</td>
                <td>
                  <button onClick={() => handleAction(l.id, 'approve')}>
                    Approve
                  </button>
                  <button onClick={() => handleAction(l.id, 'reject')}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
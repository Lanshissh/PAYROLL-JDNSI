import { useEffect, useState } from 'react';
import { getAgencyPendingLeaves, approveLeave } from '../../api/leave';

import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { notify } from '../../components/common/toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePendingMap } from '../../hooks/usePendingMap';

type LeaveRequest = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  employees?: {
    full_name: string;
  }[];
};

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { isPending, run } = usePendingMap<string>();

  const [confirm, setConfirm] = useState<null | {
    message: string;
    onConfirm: () => Promise<void>;
  }>(null);

  async function load() {
    setLoading(true);
    const data = await getAgencyPendingLeaves();
    setLeaves(data ?? []);
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    try {
      await approveLeave(id, action);
      notify.success(action === 'approve' ? 'Leave approved' : 'Leave rejected');
      await load();
    } catch {
      notify.error('Action failed');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      header: 'Employee',
      render: (l: LeaveRequest) => l.employees?.[0]?.full_name ?? '—'
    },
    {
      header: 'Type',
      render: (l: LeaveRequest) => l.leave_type
    },
    {
      header: 'From',
      render: (l: LeaveRequest) => l.start_date
    },
    {
      header: 'To',
      render: (l: LeaveRequest) => l.end_date
    },
    {
      header: 'Actions',
      render: (l: LeaveRequest) => (
        <>
          <button
            disabled={isPending(l.id)}
            onClick={() =>
              setConfirm({
                message: 'Approve this leave request?',
                onConfirm: async () => {
                  await run(l.id, async () => {
                    await handleAction(l.id, 'approve');
                  });
                  setConfirm(null);
                }
              })
            }
            style={{ marginRight: 8 }}
          >
            {isPending(l.id) ? 'Working…' : 'Approve'}
          </button>

          <button
            disabled={isPending(l.id)}
            onClick={() =>
              setConfirm({
                message: 'Reject this leave request?',
                onConfirm: async () => {
                  await run(l.id, async () => {
                    await handleAction(l.id, 'reject');
                  });
                  setConfirm(null);
                }
              })
            }
          >
            {isPending(l.id) ? 'Working…' : 'Reject'}
          </button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Pending Leave Requests</h2>

      <Card title="Leave Approvals">
        {loading && <LoadingState />}

        {!loading && leaves.length === 0 && (
          <EmptyState message="No pending leave requests." />
        )}

        {!loading && leaves.length > 0 && <DataTable data={leaves} columns={columns} />}
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
import { useEffect, useState } from 'react';
import { getMyPayslips } from '../../api/payslips';

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getMyPayslips();
    setPayslips(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>My Payslips</h2>

      {loading ? (
        <p>Loading…</p>
      ) : payslips.length === 0 ? (
        <p>No payslips yet.</p>
      ) : (
        <ul>
          {payslips.map(p => (
            <li key={p.id}>
              {new Date(p.created_at).toLocaleDateString()} —{' '}
              <a href={p.file_url} target="_blank" rel="noreferrer">
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
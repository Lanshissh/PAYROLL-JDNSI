import { useEffect, useState } from 'react';
import Tabs from '../../components/common/Tabs';
import {
  getPayrollSummaryAnalytics,
  getOTSummaryAnalytics,
  getAbsenceSummaryAnalytics
} from '../../api/analytics';

// Recharts
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('payroll');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    if (activeTab === 'payroll') {
      setData(await getPayrollSummaryAnalytics() ?? []);
    }

    if (activeTab === 'ot') {
      setData(await getOTSummaryAnalytics() ?? []);
    }

    if (activeTab === 'absence') {
      setData(await getAbsenceSummaryAnalytics() ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [activeTab]);

  /* -----------------------------
     Chart data mappers
  ------------------------------*/

  const otChartData = data.map(s => ({
    period: `${s.dimensions.period_start} → ${s.dimensions.period_end}`,
    total_ot_hours: s.metrics.total_ot_hours
  }));

  const absenceChartData = data.map(s => ({
    period: `${s.dimensions.period_start} → ${s.dimensions.period_end}`,
    absence_rate: s.metrics.absence_rate
  }));

  return (
    <div>
      <h2>Analytics Dashboard</h2>

      <Tabs
        tabs={[
          { key: 'payroll', label: 'Payroll Summary' },
          { key: 'ot', label: 'Overtime' },
          { key: 'absence', label: 'Absence' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <p>Loading…</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <>
          {/* =========================
              OVERTIME CHART
          ========================== */}
          {activeTab === 'ot' && (
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 12,
                marginBottom: 24
              }}
            >
              <h3>Overtime Hours Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={otChartData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_ot_hours" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* =========================
              ABSENCE CHART
          ========================== */}
          {activeTab === 'absence' && (
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 12,
                marginBottom: 24
              }}
            >
              <h3>Absence Rate Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={absenceChartData}>
                  <XAxis dataKey="period" />
                  <YAxis
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value !== 'number') return ['0%', 'Absence Rate'];
                      return [`${(value * 100).toFixed(2)}%`, 'Absence Rate'];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absence_rate"
                    stroke="#dc2626"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* =========================
              DATA TABLE (UNCHANGED)
          ========================== */}
          <table>
            <thead>
              <tr>
                <th>Period</th>

                {activeTab === 'payroll' && (
                  <>
                    <th>Employees</th>
                    <th>Gross Pay</th>
                    <th>OT Hours</th>
                    <th>Leave Days</th>
                  </>
                )}

                {activeTab === 'ot' && (
                  <>
                    <th>OT Hours</th>
                    <th>OT Cost</th>
                  </>
                )}

                {activeTab === 'absence' && (
                  <>
                    <th>Paid Leave</th>
                    <th>Unpaid Leave</th>
                    <th>Absence Rate</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {data.map((s: any) => (
                <tr key={s.id}>
                  <td>
                    {s.dimensions.period_start} → {s.dimensions.period_end}
                  </td>

                  {activeTab === 'payroll' && (
                    <>
                      <td>{s.metrics.total_employees}</td>
                      <td>{s.metrics.gross_pay?.toLocaleString()}</td>
                      <td>{s.metrics.total_ot_hours}</td>
                      <td>{s.metrics.total_leave_days}</td>
                    </>
                  )}

                  {activeTab === 'ot' && (
                    <>
                      <td>{s.metrics.total_ot_hours}</td>
                      <td>{s.metrics.total_ot_cost?.toLocaleString()}</td>
                    </>
                  )}

                  {activeTab === 'absence' && (
                    <>
                      <td>{s.metrics.paid_leave_days}</td>
                      <td>{s.metrics.unpaid_leave_days}</td>
                      <td>
                        {(s.metrics.absence_rate * 100).toFixed(2)}%
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import Tabs from '../../components/common/Tabs';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';

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
  const [activeTab, setActiveTab] = useState<'payroll' | 'ot' | 'absence'>(
    'payroll'
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    if (activeTab === 'payroll') {
      setData((await getPayrollSummaryAnalytics()) ?? []);
    }

    if (activeTab === 'ot') {
      setData((await getOTSummaryAnalytics()) ?? []);
    }

    if (activeTab === 'absence') {
      setData((await getAbsenceSummaryAnalytics()) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [activeTab]);

  /* -----------------------------
     Chart data mappers
  ------------------------------ */

  const otChartData = data.map(s => ({
    period: `${s.dimensions.period_start} → ${s.dimensions.period_end}`,
    total_ot_hours: s.metrics.total_ot_hours
  }));

  const absenceChartData = data.map(s => ({
    period: `${s.dimensions.period_start} → ${s.dimensions.period_end}`,
    absence_rate: s.metrics.absence_rate
  }));

  /* -----------------------------
     Table column definitions
  ------------------------------ */

  const payrollColumns = [
    {
      header: 'Period',
      render: (s: any) =>
        `${s.dimensions.period_start} → ${s.dimensions.period_end}`
    },
    { header: 'Employees', render: (s: any) => s.metrics.total_employees },
    {
      header: 'Gross Pay',
      render: (s: any) => s.metrics.gross_pay?.toLocaleString()
    },
    { header: 'OT Hours', render: (s: any) => s.metrics.total_ot_hours },
    { header: 'Leave Days', render: (s: any) => s.metrics.total_leave_days }
  ];

  const otColumns = [
    {
      header: 'Period',
      render: (s: any) =>
        `${s.dimensions.period_start} → ${s.dimensions.period_end}`
    },
    { header: 'OT Hours', render: (s: any) => s.metrics.total_ot_hours },
    {
      header: 'OT Cost',
      render: (s: any) => s.metrics.total_ot_cost?.toLocaleString()
    }
  ];

  const absenceColumns = [
    {
      header: 'Period',
      render: (s: any) =>
        `${s.dimensions.period_start} → ${s.dimensions.period_end}`
    },
    { header: 'Paid Leave', render: (s: any) => s.metrics.paid_leave_days },
    { header: 'Unpaid Leave', render: (s: any) => s.metrics.unpaid_leave_days },
    {
      header: 'Absence Rate',
      render: (s: any) =>
        `${(s.metrics.absence_rate * 100).toFixed(2)}%`
    }
  ];

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

      {loading && <LoadingState />}

      {!loading && data.length === 0 && <EmptyState />}

      {!loading && data.length > 0 && (
        <>
          {/* =========================
              OVERTIME CHART
          ========================== */}
          {activeTab === 'ot' && (
            <Card title="Overtime Hours Trend">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={otChartData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_ot_hours" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* =========================
              ABSENCE CHART
          ========================== */}
          {activeTab === 'absence' && (
            <Card title="Absence Rate Trend">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={absenceChartData}>
                  <XAxis dataKey="period" />
                  <YAxis
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value !== 'number')
                        return ['0%', 'Absence Rate'];
                      return [
                        `${(value * 100).toFixed(2)}%`,
                        'Absence Rate'
                      ];
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
            </Card>
          )}

          {/* =========================
              DATA TABLE
          ========================== */}
          <Card>
            <DataTable
              data={data}
              columns={
                activeTab === 'payroll'
                  ? payrollColumns
                  : activeTab === 'ot'
                  ? otColumns
                  : absenceColumns
              }
            />
          </Card>
        </>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import Tabs from '../../components/common/Tabs';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  getPayrollSummaryAnalytics,
  getOTSummaryAnalytics,
  getAbsenceSummaryAnalytics
} from '../../api/analytics';
import './AnalyticsPage.css';

type AnalyticsDimensions = {
  period_start: string;
  period_end: string;
};

type AnalyticsMetrics = {
  total_employees?: number;
  gross_pay?: number;
  total_ot_hours?: number;
  total_leave_days?: number;
  total_ot_cost?: number;
  paid_leave_days?: number;
  unpaid_leave_days?: number;
  absence_rate?: number;
};

type AnalyticsRecord = {
  id: string;
  dimensions: AnalyticsDimensions;
  metrics: AnalyticsMetrics;
};

type AnalyticsTab = 'payroll' | 'ot' | 'absence';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('payroll');
  const [data, setData] = useState<AnalyticsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabLabel = useMemo(() => {
    if (activeTab === 'ot') {
      return 'Overtime Summary';
    }

    if (activeTab === 'absence') {
      return 'Absence Summary';
    }

    return 'Payroll Summary';
  }, [activeTab]);

  function formatNumber(value?: number) {
    if (value === undefined || value === null) {
      return '—';
    }

    return numberFormatter.format(value);
  }

  function formatCurrency(value?: number) {
    if (value === undefined || value === null) {
      return '—';
    }

    return currencyFormatter.format(value);
  }

  function formatRate(value?: number) {
    if (value === undefined || value === null) {
      return '—';
    }

    return `${(value * 100).toFixed(2)}%`;
  }

  async function load() {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'payroll') {
        setData((await getPayrollSummaryAnalytics()) ?? []);
      }

      if (activeTab === 'ot') {
        setData((await getOTSummaryAnalytics()) ?? []);
      }

      if (activeTab === 'absence') {
        setData((await getAbsenceSummaryAnalytics()) ?? []);
      }
    } catch (err) {
      console.error(err);
      setData([]);
      setError('We could not load analytics for this view. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [activeTab]);

  return (
    <div className="analytics-page">
      <div className="analytics-page__header">
        <div>
          <p className="analytics-page__eyebrow">Analytics</p>
          <h2 className="analytics-page__title">Analytics Dashboard</h2>
          <p className="analytics-page__subtitle">
            Track multi-agency payroll, overtime, and absence trends in one place.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'payroll', label: 'Payroll Summary' },
          { key: 'ot', label: 'Overtime' },
          { key: 'absence', label: 'Absence' }
        ]}
        active={activeTab}
        onChange={(tab) => setActiveTab(tab as AnalyticsTab)}
      />

      <section className="analytics-page__card">
        <div className="analytics-page__card-header">
          <div>
            <h3>{tabLabel}</h3>
            <p>Latest periods pulled from the analytics service.</p>
          </div>
        </div>

        <div className="analytics-page__content">
          {loading && (
            <div className="analytics-page__center">
              <Loader label="Loading analytics" />
            </div>
          )}

          {!loading && error && (
            <EmptyState
              title="Unable to load analytics"
              description={error}
            />
          )}

          {!loading && !error && data.length === 0 && (
            <EmptyState
              title="No analytics available"
              description="Once payroll runs are processed, summary analytics will appear here."
            />
          )}

          {!loading && !error && data.length > 0 && (
            <div className="analytics-table">
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
                  {data.map((record) => (
                    <tr key={record.id}>
                      <td>
                        {record.dimensions.period_start} → {record.dimensions.period_end}
                      </td>

                      {activeTab === 'payroll' && (
                        <>
                          <td>{formatNumber(record.metrics.total_employees)}</td>
                          <td>{formatCurrency(record.metrics.gross_pay)}</td>
                          <td>{formatNumber(record.metrics.total_ot_hours)}</td>
                          <td>{formatNumber(record.metrics.total_leave_days)}</td>
                        </>
                      )}

                      {activeTab === 'ot' && (
                        <>
                          <td>{formatNumber(record.metrics.total_ot_hours)}</td>
                          <td>{formatCurrency(record.metrics.total_ot_cost)}</td>
                        </>
                      )}

                      {activeTab === 'absence' && (
                        <>
                          <td>{formatNumber(record.metrics.paid_leave_days)}</td>
                          <td>{formatNumber(record.metrics.unpaid_leave_days)}</td>
                          <td>{formatRate(record.metrics.absence_rate)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

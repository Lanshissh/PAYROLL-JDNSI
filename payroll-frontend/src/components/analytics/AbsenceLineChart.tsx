import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

type Props = {
  data: {
    period: string;
    absence_rate: number;
  }[];
};

export default function AbsenceLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey="period" />
        <YAxis
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />

        <Tooltip
          formatter={(value) => {
            if (typeof value !== 'number') return '0%';
            return `${(value * 100).toFixed(2)}%`;
          }}
        />

        <Line
          type="monotone"
          dataKey="absence_rate"
          stroke="#dc2626"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
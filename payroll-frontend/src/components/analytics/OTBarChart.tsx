import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

type Props = {
  data: {
    period: string;
    total_ot_hours: number;
  }[];
};

export default function OTBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_ot_hours" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}
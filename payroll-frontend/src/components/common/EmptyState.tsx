type Props = {
  message?: string;
};

export default function EmptyState({ message = 'No data available.' }: Props) {
  return (
    <div
      style={{
        padding: 40,
        textAlign: 'center',
        color: '#64748b'
      }}
    >
      <p>{message}</p>
    </div>
  );
}
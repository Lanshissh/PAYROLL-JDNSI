type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function Card({ title, children }: Props) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)'
      }}
    >
      {title && (
        <h3 style={{ marginBottom: 16 }}>{title}</h3>
      )}
      {children}
    </div>
  );
}
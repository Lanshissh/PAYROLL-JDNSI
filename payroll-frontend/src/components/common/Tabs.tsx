type Tab = {
  key: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export default function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            borderBottom: active === t.key ? '2px solid #2563eb' : 'none',
            background: 'transparent'
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
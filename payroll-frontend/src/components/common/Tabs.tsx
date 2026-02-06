type Tab<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
};

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange
}: Props<T>) {
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
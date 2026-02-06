import { useState } from 'react';

type Item = {
  label: string;
  done: boolean;
};

export default function ProjectChecklist() {
  const [items, setItems] = useState<Item[]>([
    { label: 'Database schema & RLS', done: true },
    { label: 'Payroll calculation engine', done: true },
    { label: 'Sandbox payroll', done: true },
    { label: 'Leave module', done: true },
    { label: 'Analytics backend', done: true },
    { label: 'Permissions system', done: true },

    { label: 'Frontend auth & role redirect', done: true },
    { label: 'Admin / Agency / Employee layouts', done: false },
    { label: 'Leave UI', done: false },
    { label: 'Payroll UI', done: false },
    { label: 'Analytics dashboard UI', done: false },

    { label: 'ZKTeco K40 integration', done: false }
  ]);

  function toggle(index: number) {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  }

  const completed = items.filter(i => i.done).length;
  const total = items.length;

  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      <h3>📋 Project Checklist</h3>
      <p>
        Progress: <strong>{completed}/{total}</strong>
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(idx)}
                style={{ marginRight: 8 }}
              />
              {item.done ? '✅ ' : '⬜ '}
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
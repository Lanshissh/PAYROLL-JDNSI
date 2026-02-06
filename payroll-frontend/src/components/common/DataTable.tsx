type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
};

export default function DataTable<T>({ columns, data }: Props<T>) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th
              key={idx}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <td
                key={colIdx}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
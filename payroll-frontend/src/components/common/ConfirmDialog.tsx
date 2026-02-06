type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Confirm action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          width: 400,
          maxWidth: '90%'
        }}
      >
        <h3 style={{ marginBottom: 12 }}>{title}</h3>
        <p style={{ marginBottom: 20 }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ marginRight: 8 }}>
            {cancelText}
          </button>
          <button onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state__icon" aria-hidden="true">
        <span>📊</span>
      </div>
      <div>
        <h3 className="empty-state__title">{title}</h3>
        {description && <p className="empty-state__description">{description}</p>}
        {children && <div className="empty-state__actions">{children}</div>}
      </div>
    </div>
  );
}

import './Loader.css';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  label?: string;
  size?: LoaderSize;
}

const sizeMap: Record<LoaderSize, number> = {
  sm: 20,
  md: 28,
  lg: 36
};

export default function Loader({ label = 'Loading', size = 'md' }: LoaderProps) {
  const spinnerSize = sizeMap[size];

  return (
    <div className="loader" role="status" aria-live="polite">
      <span
        className="loader__spinner"
        style={{ width: spinnerSize, height: spinnerSize }}
        aria-hidden="true"
      />
      <span className="loader__label">{label}</span>
    </div>
  );
}

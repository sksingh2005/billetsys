export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner-ring" aria-hidden="true" />
      {label ? <span className="loading-spinner-label">{label}</span> : null}
    </div>
  );
}

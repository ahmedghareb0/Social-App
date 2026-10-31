interface LoadingProps {
  label?: string;
}

export default function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      {label}
    </div>
  );
}

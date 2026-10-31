interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  errorMessage?: string | null;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  errorMessage,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onCancel();
      }}
    >
      <section
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <h2 className="dialog-title" id="confirm-dialog-title">
          {title}
        </h2>
        <p className="page-subtitle">{description}</p>
        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
          </div>
        )}
        <div className="inline-actions">
          <button
            className="button secondary"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="button danger"
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

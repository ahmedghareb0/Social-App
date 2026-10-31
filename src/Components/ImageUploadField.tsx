import { useEffect, useRef, useState } from "react";

interface ImageUploadFieldProps {
  image?: File;
  onImageChange: (image?: File) => void;
  disabled?: boolean;
}

export default function ImageUploadField({
  image,
  onImageChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [inputVersion, setInputVersion] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function removeImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    onImageChange(undefined);
    setValidationError(null);
    setInputVersion((version) => version + 1);
  }

  return (
    <div className="image-upload">
      <label className="field">
        <span className="muted">Add an image (optional)</span>
        <input
          accept="image/*"
          className="input"
          disabled={disabled}
          key={inputVersion}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
              if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
              previewUrlRef.current = null;
              setPreviewUrl(null);
              onImageChange(undefined);
              setValidationError("Choose a supported image file.");
              setInputVersion((version) => version + 1);
              return;
            }
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = URL.createObjectURL(file);
            setPreviewUrl(previewUrlRef.current);
            setValidationError(null);
            onImageChange(file);
          }}
          ref={inputRef}
          type="file"
        />
      </label>
      {validationError && (
        <p className="field-error" role="alert">{validationError}</p>
      )}
      {image && (
        <div className="image-upload-preview">
          <div className="image-upload-details">
            {previewUrl && <img alt={`Preview of ${image.name}`} src={previewUrl} />}
            <span className="image-upload-name">{image.name}</span>
          </div>
          <button
            className="text-button"
            disabled={disabled}
            onClick={removeImage}
            type="button"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { getTextValue, type ApiRecord } from "../api/data";
import { updatePost } from "../api/postsApi";
import { getErrorMessage } from "../api/client";
import ErrorMessage from "./ErrorMessage";
import ImageUploadField from "./ImageUploadField";

interface EditPostProps {
  post: ApiRecord;
  postId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPost({ post, postId, onClose, onUpdated }: EditPostProps) {
  const [body, setBody] = useState(getTextValue(post));
  const [image, setImage] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text && !image) {
      setError("Post text or an image is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await updatePost(postId, text, image);
      onUpdated();
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSubmitting) onClose();
    }} role="presentation">
      <section aria-labelledby="edit-post-title" aria-modal="true" className="dialog" role="dialog">
        <h2 className="dialog-title" id="edit-post-title">Edit post</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Post text</span>
            <textarea
              className="textarea"
              onChange={(event) => setBody(event.target.value)}
              value={body}
            />
          </label>
          <ImageUploadField
            disabled={isSubmitting}
            image={image}
            onImageChange={setImage}
          />
          {error && <ErrorMessage message={error} />}
          <div className="inline-actions">
            <button className="button secondary" disabled={isSubmitting} onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

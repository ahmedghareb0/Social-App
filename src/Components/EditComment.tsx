import { useState, type FormEvent } from "react";
import type { Comment } from "../api/commentsApi";
import { updateComment } from "../api/commentsApi";
import { getErrorMessage } from "../api/client";
import ErrorMessage from "./ErrorMessage";
import ImageUploadField from "./ImageUploadField";

interface EditCommentProps {
  postId: string;
  comment: Comment;
  commentId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditComment({
  postId,
  comment,
  commentId,
  onClose,
  onUpdated,
}: EditCommentProps) {
  const [content, setContent] = useState(
    typeof comment.content === "string" ? comment.content : "",
  );
  const [image, setImage] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = content.trim();
    if (!text && !image) {
      setError("Comment text or an image is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await updateComment(postId, commentId, text, image);
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
      <section aria-labelledby="edit-comment-title" aria-modal="true" className="dialog" role="dialog">
        <h2 className="dialog-title" id="edit-comment-title">Edit comment</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Comment text</span>
            <textarea
              className="textarea"
              onChange={(event) => setContent(event.target.value)}
              value={content}
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

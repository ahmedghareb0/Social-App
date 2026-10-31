import { useState, type FormEvent } from "react";
import { createPost } from "../../api/postsApi";
import type { Post } from "../../api/postsApi";
import { getErrorMessage } from "../../api/client";
import ErrorMessage from "../ErrorMessage";
import ImageUploadField from "../ImageUploadField";

interface CreatePostProps {
  onCreated: (post: Post) => void;
}

export default function CreatePost({ onCreated }: CreatePostProps) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text && !image) {
      setError("Write something or choose an image before publishing.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const createdPost = await createPost(text, image);
      setBody("");
      setImage(undefined);
      setFileInputKey((value) => value + 1);
      onCreated(createdPost);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel form-stack" onSubmit={handleSubmit} style={{ padding: 20, marginBottom: 20 }}>
      <label className="field">
        <span className="sr-only">Post text</span>
        <textarea
          className="textarea"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share something with your community..."
          value={body}
        />
      </label>
      <div className="attachment-actions">
        <ImageUploadField
          disabled={isSubmitting}
          image={image}
          key={fileInputKey}
          onImageChange={setImage}
        />
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publishing..." : "Publish"}
        </button>
      </div>
      {error && <ErrorMessage message={error} />}
    </form>
  );
}

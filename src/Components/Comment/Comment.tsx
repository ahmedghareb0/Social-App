import { useState } from "react";
import {
  isApiRecord,
  isCommentOwnedBy,
} from "../../api/data";
import type { Comment as ApiComment } from "../../api/commentsApi";
import type { UserRecord } from "../../context/AuthContext";

interface CommentProps {
  comment: ApiComment;
  currentUser: UserRecord | null;
  canDeleteAsPostOwner: boolean;
  onEdit?: (comment: ApiComment) => void;
  onDelete?: (comment: ApiComment) => void;
}

function formatCreationDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function Comment({
  comment,
  currentUser,
  canDeleteAsPostOwner,
  onEdit,
  onDelete,
}: CommentProps) {
  const [authorImageFailed, setAuthorImageFailed] = useState(false);
  const creator = isApiRecord(comment.commentCreator) ? comment.commentCreator : null;
  const authorName = typeof creator?.name === "string" ? creator.name : "";
  const username = typeof creator?.username === "string" ? creator.username : "";
  const authorImage = typeof creator?.photo === "string" ? creator.photo : "";
  const commentId = typeof comment._id === "string" ? comment._id : "";
  const isOwner = isCommentOwnedBy(comment, currentUser);
  const canDelete = isOwner || canDeleteAsPostOwner;
  const text = typeof comment.content === "string" ? comment.content : "";
  const image = typeof comment.image === "string" && comment.image.trim()
    ? comment.image
    : null;
  const created = formatCreationDate(comment.createdAt);
  const repliesCount =
    typeof comment.repliesCount === "number" &&
    Number.isInteger(comment.repliesCount) &&
    comment.repliesCount > 0
      ? comment.repliesCount
      : 0;

  return (
    <article className="comment">
      <header className="comment-header">
        <div className="avatar">
          {authorImage && !authorImageFailed ? (
            <img
              alt={authorName || "Author"}
              onError={() => setAuthorImageFailed(true)}
              src={authorImage}
            />
          ) : (
            (authorName || "C").slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <div className="author-name">{authorName || "Comment author"}</div>
          {username && <div className="comment-username">@{username}</div>}
          {created && <time className="post-date">{created}</time>}
        </div>
        <div className="inline-actions" style={{ marginLeft: "auto" }}>
          {commentId && isOwner && onEdit && (
            <button
              className="text-button"
              onClick={() => onEdit(comment)}
              type="button"
            >
              Edit
            </button>
          )}
          {commentId && canDelete && onDelete && (
            <button
              className="text-button"
              onClick={() => onDelete(comment)}
              type="button"
            >
              Delete
            </button>
          )}
        </div>
      </header>
      <p className="comment-body">{text || "This comment has no text content."}</p>
      {image && (
        <img
          alt="Comment attachment"
          className="comment-image"
          onError={(event) => { event.currentTarget.hidden = true; }}
          src={image}
        />
      )}
      {repliesCount > 0 && (
        <p className="comment-replies">
          {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
        </p>
      )}
      {comment.parentComment !== null && comment.parentComment !== undefined && (
        <span className="comment-reply-label">Reply</span>
      )}
    </article>
  );
}

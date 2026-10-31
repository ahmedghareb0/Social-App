import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatApiValue,
  getRecordId,
  getUserId,
  isApiRecord,
  isPostOwnedBy,
  type ApiRecord,
} from "../../api/data";
import type { UserRecord } from "../../context/AuthContext";

interface PostProps {
  post: ApiRecord;
  currentUser: UserRecord | null;
  onEdit?: (post: ApiRecord) => void;
  showDetailsLink?: boolean;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function formatCreationDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function Post({
  post,
  currentUser,
  onEdit,
  showDetailsLink = true,
}: PostProps) {
  const [authorImageFailed, setAuthorImageFailed] = useState(false);
  const postId = getRecordId(post, "post");
  const postUserId = typeof post.user === "string" ? post.user : null;
  const author =
    isApiRecord(post.user)
      ? post.user
      : postUserId && getUserId(currentUser) === postUserId
        ? currentUser
        : null;
  const authorName = stringValue(author?.name);
  const authorUsername = stringValue(author?.username);
  const authorImage = stringValue(author?.photo);
  const text = stringValue(post.body);
  const postImage =
    typeof post.image === "string" && post.image.trim() ? post.image : null;
  const created = formatCreationDate(post.createdAt);
  const isOwner = isPostOwnedBy(post, currentUser);
  const detailsState = { post };
  const likesCount =
    typeof post.likesCount === "number"
      ? post.likesCount
      : Array.isArray(post.likes)
        ? post.likes.length
        : null;
  const commentsCount = typeof post.commentsCount === "number" ? post.commentsCount : null;
  const sharesCount = typeof post.sharesCount === "number" ? post.sharesCount : null;
  const privacy = stringValue(post.privacy);
  const isShare = post.isShare === true || (post.sharedPost !== null && post.sharedPost !== undefined);

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="avatar">
          {authorImage && !authorImageFailed ? (
            <img
              alt={authorName || "Author"}
              onError={() => setAuthorImageFailed(true)}
              src={authorImage}
            />
          ) : (
            (authorName || "P").slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <div className="author-name">{authorName || "Post author"}</div>
          {authorUsername && <div className="post-username">@{authorUsername}</div>}
          {created && <time className="post-date">{created}</time>}
        </div>
      </header>

      {(isShare || privacy || post.bookmarked === true) && (
        <div className="post-labels">
          {isShare && <span className="post-label">Shared post</span>}
          {privacy && <span className="post-label">{privacy}</span>}
          {post.bookmarked === true && <span className="post-label">Bookmarked</span>}
        </div>
      )}
      <p className="post-body">{text || "This post has no text content."}</p>
      {postImage && (
        <img
          alt="Post attachment"
          className="post-image"
          onError={(event) => { event.currentTarget.hidden = true; }}
          src={postImage}
        />
      )}

      {likesCount !== null || commentsCount !== null || sharesCount !== null ? (
        <div className="post-stats">
          {likesCount !== null && <span>Likes: {formatApiValue(likesCount)}</span>}
          {commentsCount !== null && <span>Comments: {formatApiValue(commentsCount)}</span>}
          {sharesCount !== null && <span>Shares: {formatApiValue(sharesCount)}</span>}
        </div>
      ) : null}

      {(showDetailsLink || (postId && isOwner && onEdit)) && <footer className="post-actions">
        {showDetailsLink && postId ? (
          <Link className="button secondary small" to={`/posts/${encodeURIComponent(postId)}`} state={detailsState}>
            View details
          </Link>
        ) : showDetailsLink ? (
          <span className="muted">Post ID is unavailable in the API response.</span>
        ) : null}
        {postId && isOwner && onEdit && (
          <button
            className="button secondary small"
            onClick={() => onEdit(post)}
            type="button"
          >
            Edit
          </button>
        )}
      </footer>}
    </article>
  );
}

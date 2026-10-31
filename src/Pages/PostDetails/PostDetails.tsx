import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getRecordId,
  isApiRecord,
  isPostOwnedBy,
  type ApiRecord,
} from "../../api/data";
import { getErrorMessage } from "../../api/client";
import {
  createComment,
  deleteComment,
  getComments,
  parseComments,
  parseCommentsPagination,
  type Comment as ApiComment,
  type CommentsPagination,
} from "../../api/commentsApi";
import { getPostById } from "../../api/postsApi";
import Comment from "../../Components/Comment/Comment";
import ConfirmDialog from "../../Components/ConfirmDialog";
import EditComment from "../../Components/EditComment";
import ErrorMessage from "../../Components/ErrorMessage";
import ImageUploadField from "../../Components/ImageUploadField";
import Loading from "../../Components/Loading";
import Post from "../../Components/Post/Post";
import { useAuth } from "../../context/useAuth";

const PAGE_SIZE = 10;

interface PostLocationState {
  post?: unknown;
}

export default function PostDetails() {
  const { postId = "" } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const locationState = location.state as PostLocationState | null;
  const statePost = isApiRecord(locationState?.post) ? locationState.post : null;
  const passedPost =
    statePost && getRecordId(statePost, "post") === postId ? statePost : null;
  const [postResult, setPostResult] = useState<{
    postId: string;
    post: ApiRecord;
  } | null>(() =>
    passedPost ? { postId, post: passedPost } : null,
  );
  const [postErrorResult, setPostErrorResult] = useState<{
    postId: string;
    message: string;
  } | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsPagination, setCommentsPagination] =
    useState<CommentsPagination | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<File | undefined>();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [loadedCommentsKey, setLoadedCommentsKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<ApiComment | null>(null);
  const [deletingComment, setDeletingComment] = useState<ApiComment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const editingCommentId =
    typeof editingComment?._id === "string" ? editingComment._id : null;
  const commentsRequestKey = `${postId}:${page}:${refreshKey}`;
  const commentsPending =
    isLoadingComments || loadedCommentsKey !== commentsRequestKey;
  const post =
    postResult?.postId === postId ? postResult.post : null;
  const visiblePostError =
    postErrorResult?.postId === postId ? postErrorResult.message : null;

  useEffect(() => {
    let active = true;
    getPostById(postId)
      .then((record) => {
        if (active) setPostResult({ postId, post: record });
      })
      .catch((requestError: unknown) => {
        if (active) {
          setPostErrorResult({ postId, message: getErrorMessage(requestError) });
        }
      });

    return () => {
      active = false;
    };
  }, [postId]);

  useEffect(() => {
    let active = true;
    getComments(postId, page, PAGE_SIZE)
      .then((response) => {
        const records = parseComments(response.data);
        const pagination = parseCommentsPagination(response.meta?.pagination);
        if (active) {
          setComments(records);
          setCommentsPagination(pagination ?? null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setComments([]);
          setCommentsPagination(null);
          setCommentsError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingComments(false);
          setLoadedCommentsKey(commentsRequestKey);
        }
      });

    return () => {
      active = false;
    };
  }, [commentsRequestKey, page, postId, refreshKey]);

  function reloadComments() {
    setIsLoadingComments(true);
    setCommentsError(null);
    setRefreshKey((value) => value + 1);
  }

  function changePage(nextPage: number) {
    setIsLoadingComments(true);
    setCommentsError(null);
    setPage(nextPage);
  }

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text && !commentImage) {
      setFormError("Write a comment or choose an image.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await createComment(postId, text, commentImage);
      setCommentText("");
      setCommentImage(undefined);
      setFileInputKey((value) => value + 1);
      setPage(1);
      reloadComments();
    } catch (requestError) {
      setFormError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment() {
    const commentId = deletingComment?._id;
    if (!commentId) {
      setDeleteError("The comment ID is unavailable in the API response.");
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteComment(postId, commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
      setDeletingComment(null);
      reloadComments();
    } catch (requestError) {
      setDeleteError(getErrorMessage(requestError));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="page-container">
      <Link className="inline-link" to="/">Back to Home</Link>
      <header style={{ margin: "16px 0 22px" }}>
        <h1 className="page-heading">Post details</h1>
      </header>

      {post && (
        <Post
          currentUser={user}
          post={post}
          showDetailsLink={false}
        />
      )}
      {visiblePostError && <ErrorMessage message={visiblePostError} />}
      {!post && !visiblePostError && <Loading label="Loading post..." />}

      <section aria-labelledby="comments-heading" className="panel" style={{ padding: 20 }}>
        <h2 className="page-heading" id="comments-heading" style={{ fontSize: "1.3rem" }}>
          Comments
        </h2>
        <form className="form-stack" onSubmit={handleCreateComment}>
          <label className="field">
            <span className="sr-only">Write a comment</span>
            <textarea
              className="textarea"
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              value={commentText}
            />
          </label>
          <div className="attachment-actions">
            <ImageUploadField
              disabled={isSubmitting}
              image={commentImage}
              key={fileInputKey}
              onImageChange={setCommentImage}
            />
            <button className="button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Comment"}
            </button>
          </div>
          {formError && <ErrorMessage message={formError} />}
        </form>

        {commentsError && <ErrorMessage message={commentsError} onRetry={reloadComments} />}
        {commentsPending ? (
          <Loading label="Loading comments..." />
        ) : !commentsError && comments.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 18 }}>No comments on this page yet.</div>
        ) : (
          !commentsError && (
            <div className="comment-list">
              {comments.map((comment, index) => {
                const commentId =
                  typeof comment._id === "string" ? comment._id : null;
                return (
                  <Comment
                    canDeleteAsPostOwner={Boolean(post && isPostOwnedBy(post, user))}
                    comment={comment}
                    currentUser={user}
                    key={commentId ?? `comment-${page}-${index}`}
                    onDelete={(comment) => {
                      setDeleteError(null);
                      setDeletingComment(comment);
                    }}
                    onEdit={setEditingComment}
                  />
                );
              })}
            </div>
          )
        )}

        {!commentsPending && !commentsError && commentsPagination && (
          <nav aria-label="Comment pagination" className="pagination">
            <button
              className="button secondary small"
              disabled={commentsPagination.currentPage <= 1}
              onClick={() => changePage(Math.max(1, commentsPagination.currentPage - 1))}
              type="button"
            >
              Previous
            </button>
            <span>
              {commentsPagination.total === 0
                ? `0 comments · ${commentsPagination.limit} per page`
                : `Page ${commentsPagination.currentPage} of ${commentsPagination.numberOfPages} · ${commentsPagination.total} comments · ${commentsPagination.limit} per page`}
            </span>
            <button
              className="button secondary small"
              disabled={commentsPagination.currentPage >= commentsPagination.numberOfPages}
              onClick={() => changePage(commentsPagination.currentPage + 1)}
              type="button"
            >
              Next
            </button>
          </nav>
        )}
      </section>

      {editingComment && editingCommentId && (
        <EditComment
          comment={editingComment}
          commentId={editingCommentId}
          onClose={() => setEditingComment(null)}
          onUpdated={reloadComments}
          postId={postId}
        />
      )}
      {deletingComment && (
        <ConfirmDialog
          description="This comment will be permanently removed."
          errorMessage={deleteError}
          isLoading={isDeleting}
          onCancel={() => setDeletingComment(null)}
          onConfirm={handleDeleteComment}
          title="Delete comment?"
        />
      )}
    </main>
  );
}

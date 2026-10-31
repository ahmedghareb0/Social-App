import { useEffect, useState } from "react";
import { getRecordId, isApiRecord, type ApiRecord } from "../../api/data";
import { getErrorMessage } from "../../api/client";
import {
  getFeed,
  parseFeedPosts,
  type FeedPagination,
  type Post as FeedPost,
} from "../../api/postsApi";
import CreatePost from "../../Components/CreatePost/CreatePost";
import EditPost from "../../Components/EditPost";
import ErrorMessage from "../../Components/ErrorMessage";
import Loading from "../../Components/Loading";
import Post from "../../Components/Post/Post";
import { useAuth } from "../../context/useAuth";

const PAGE_SIZE = 10;

function parseFeedPagination(value: unknown): FeedPagination | null {
  if (!isApiRecord(value)) return null;
  const { currentPage, limit, total, numberOfPages } = value;
  if (
    typeof currentPage !== "number" ||
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    typeof limit !== "number" ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    typeof total !== "number" ||
    !Number.isInteger(total) ||
    total < 0 ||
    typeof numberOfPages !== "number" ||
    !Number.isInteger(numberOfPages) ||
    numberOfPages < 0
  ) {
    return null;
  }
  return { currentPage, limit, total, numberOfPages };
}

export default function Feed() {
  const { user, authError } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [createdPost, setCreatedPost] = useState<FeedPost | null>(null);
  const [pagination, setPagination] = useState<FeedPagination | null>(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<ApiRecord | null>(null);

  useEffect(() => {
    let active = true;
    getFeed({ page, limit: PAGE_SIZE, only: "following" })
      .then((response) => {
        const records = parseFeedPosts(response.data);
        const parsedPagination = parseFeedPagination(response.meta?.pagination);
        if (active) {
          const createdPostId = createdPost ? getRecordId(createdPost, "post") : null;
          const feedContainsCreatedPost =
            createdPostId && records.some((post) => getRecordId(post, "post") === createdPostId);
          setPosts(
            page === 1 && createdPost && createdPostId && !feedContainsCreatedPost
              ? [createdPost, ...records]
              : records,
          );
          setPagination(parsedPagination);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setPosts(page === 1 && createdPost ? [createdPost] : []);
          setPagination(null);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [createdPost, page, refreshKey]);

  function reload() {
    setIsLoading(true);
    setError(null);
    setRefreshKey((value) => value + 1);
  }

  function afterCreate(post: FeedPost) {
    setCreatedPost(post);
    setPosts((current) => [
      post,
      ...current.filter((currentPost) => getRecordId(currentPost, "post") !== getRecordId(post, "post")),
    ]);
    setIsLoading(false);
    setError(null);
    if (page !== 1) setPage(1);
    setRefreshKey((value) => value + 1);
  }

  function changePage(nextPage: number) {
    setIsLoading(true);
    setError(null);
    setPage(nextPage);
  }

  const editingPostId = editingPost ? getRecordId(editingPost, "post") : null;

  return (
    <main className="page-container">
      <header style={{ marginBottom: 22 }}>
        <h1 className="page-heading">Your feed</h1>
        <p className="page-subtitle">Posts from the community you follow.</p>
      </header>

      <div className="notice" style={{ marginBottom: 18 }}>
        Post deletion is unavailable because the published API collection does not specify a post ID for its delete request.
      </div>
      <CreatePost onCreated={afterCreate} />
      {authError && <ErrorMessage message={authError} />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {isLoading ? (
        <Loading label="Loading your feed..." />
      ) : posts.length === 0 ? (
        <div className="empty-state">There are no posts to show on this page yet.</div>
      ) : (
        posts.map((post, index) => {
          const id = getRecordId(post, "post");
          return (
            <Post
              currentUser={user}
              key={id ?? `post-${page}-${index}`}
              onEdit={setEditingPost}
              post={post}
            />
          );
        })
      )}

      {!isLoading && !error && pagination && (
        <nav aria-label="Feed pagination" className="pagination">
          <button
            className="button secondary small"
            disabled={pagination.currentPage <= 1}
            onClick={() => changePage(Math.max(1, pagination.currentPage - 1))}
            type="button"
          >
            Previous
          </button>
          <span>
            {pagination.total === 0
              ? `0 posts · ${pagination.limit} per page`
              : `Page ${pagination.currentPage} of ${pagination.numberOfPages} · ${pagination.total} posts · ${pagination.limit} per page`}
          </span>
          <button
            className="button secondary small"
            disabled={pagination.currentPage >= pagination.numberOfPages}
            onClick={() => changePage(pagination.currentPage + 1)}
            type="button"
          >
            Next
          </button>
        </nav>
      )}

      {editingPost && editingPostId && (
        <EditPost
          onClose={() => setEditingPost(null)}
          onUpdated={reload}
          post={editingPost}
          postId={editingPostId}
        />
      )}
    </main>
  );
}

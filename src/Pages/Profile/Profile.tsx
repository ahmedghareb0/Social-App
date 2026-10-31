import { useEffect, useState } from "react";
import {
  extractProfileUser,
  getProfile,
  type ProfileUser,
} from "../../api/usersApi";
import { getFeed, parseFeedPosts } from "../../api/postsApi";
import {
  getRecordId,
  getPostOwnerId,
  getUserId,
  type ApiRecord,
} from "../../api/data";
import { getErrorMessage } from "../../api/client";
import ErrorMessage from "../../Components/ErrorMessage";
import Loading from "../../Components/Loading";
import Post from "../../Components/Post/Post";
import { useAuth } from "../../context/useAuth";

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function displayValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value) || "Not provided";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "Not provided";
}

export default function Profile() {
  const { user: authenticatedUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [posts, setPosts] = useState<ApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsErrorUserId, setPostsErrorUserId] = useState<string | null>(null);
  const [loadedPostsUserId, setLoadedPostsUserId] = useState<string | null>(null);
  const [postsRequestKey, setPostsRequestKey] = useState(0);
  const profileUser = profile ?? authenticatedUser;
  const profileUserId = getUserId(profileUser);
  const canLoadProfilePosts = Boolean(profileUserId);
  const isPostsLoading =
    postsLoading || Boolean(profileUserId && loadedPostsUserId !== profileUserId);
  const visiblePostsError =
    postsErrorUserId === profileUserId ? postsError : null;

  useEffect(() => {
    let active = true;
    getProfile()
      .then((response) => {
        const user = extractProfileUser(response.data);
        if (active) setProfile(user);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!profileUserId) return;

    getFeed({ page: 1, limit: 10, only: "me" })
      .then((response) => {
        const records = parseFeedPosts(response.data);
        if (active) {
          setPosts(records.filter((post) => getPostOwnerId(post) === profileUserId));
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setPosts([]);
          setPostsError(getErrorMessage(requestError));
          setPostsErrorUserId(profileUserId);
        }
      })
      .finally(() => {
        if (active) {
          setLoadedPostsUserId(profileUserId);
          setPostsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [profileUserId, postsRequestKey]);

  function retryPosts() {
    setPostsError(null);
    setPostsErrorUserId(null);
    setPostsLoading(true);
    setPostsRequestKey((key) => key + 1);
  }

  const displayName = typeof profile?.name === "string" && profile.name.trim()
    ? profile.name
    : "Your profile";
  const photo = typeof profile?.photo === "string" && profile.photo.trim()
    ? profile.photo
    : null;
  const initial = displayName === "Your profile" ? "?" : displayName.slice(0, 1).toUpperCase();
  const accountFields = profile
    ? [
        ["Email", displayValue(profile.email)],
        ["Date of birth", formatDate(profile.dateOfBirth)],
        ["Gender", displayValue(profile.gender)],
        ["Account created", formatDate(profile.createdAt)],
        ["Followers", displayValue(profile.followersCount)],
        ["Following", displayValue(profile.followingCount)],
        ["Bookmarks", displayValue(profile.bookmarksCount)],
      ]
    : [];

  return (
    <main className="page-container wide">
      <header style={{ marginBottom: 22 }}>
        <h1 className="page-heading">Profile</h1>
        <p className="page-subtitle">Your account information and posts.</p>
      </header>

      {isLoading ? (
        <Loading label="Loading your profile..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : profile ? (
        <section className="profile-card">
          {typeof profile.cover === "string" && profile.cover.trim() && (
            <img className="profile-cover" alt="" src={profile.cover} />
          )}
          <header className="profile-header">
            <div className="avatar profile-avatar">
              {photo && !photoFailed ? (
                <img
                  alt={`${displayName}'s profile`}
                  onError={() => setPhotoFailed(true)}
                  src={photo}
                />
              ) : (
                initial
              )}
            </div>
            <div className="profile-identity">
              <h2 className="page-heading">{displayName}</h2>
              <p className="profile-username">
                {typeof profile.username === "string" && profile.username.trim()
                  ? `@${profile.username}`
                  : "Username not provided"}
              </p>
            </div>
          </header>
          <section aria-labelledby="account-information-heading" className="profile-account">
            <h3 id="account-information-heading">Account information</h3>
            <div className="profile-fields">
              {accountFields.map(([label, value]) => (
                <div className="profile-field" key={label}>
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section aria-labelledby="profile-posts-heading">
        <h2 className="page-heading" id="profile-posts-heading" style={{ fontSize: "1.35rem" }}>
          My Posts
        </h2>
        {!isLoading && !canLoadProfilePosts ? (
          <div className="notice">
            Your profile response does not expose a user ID, so the posts listing cannot be safely filtered to your posts.
          </div>
        ) : isPostsLoading ? (
          <Loading label="Loading your posts..." />
        ) : visiblePostsError ? (
          <ErrorMessage message={visiblePostsError} onRetry={retryPosts} />
        ) : posts.length === 0 ? (
          <div className="empty-state">You haven&apos;t created any posts yet.</div>
        ) : (
          posts.map((post, index) => (
            <Post
              currentUser={profileUser}
              key={getRecordId(post, "post") ?? `profile-post-${index}`}
              post={post}
            />
          ))
        )}
      </section>
    </main>
  );
}

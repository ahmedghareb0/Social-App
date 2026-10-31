import { request, type ApiResponse } from "./client";
import { getRecordId, getRecords, isApiRecord, type ApiRecord } from "./data";

const DEFAULT_PAGE_SIZE = 10;

export const postEndpointVerification = {
  getById: false,
  delete: false,
} as const;

export class UnverifiedPostEndpointError extends Error {
  constructor(postId: string) {
    super(`Post deletion is unavailable: the published API request has no post ID in its path (requested post ${postId}).`);
    this.name = "UnverifiedPostEndpointError";
  }
}

export interface FeedQuery {
  page: number;
  limit?: number;
  only?: "following" | "me" | "all";
}

export interface PostUser extends ApiRecord {
  _id?: string | null;
  name?: string | null;
  username?: string | null;
  photo?: string | null;
}

export type PostAuthor = PostUser | string;

export interface Post extends ApiRecord {
  _id?: string | null;
  id?: string | null;
  body?: string | null;
  image?: string | null;
  privacy?: string | null;
  user?: PostAuthor | null;
  sharedPost?: unknown;
  likes?: unknown[] | null;
  createdAt?: string | null;
  commentsCount?: number | null;
  topComment?: unknown;
  sharesCount?: number | null;
  likesCount?: number | null;
  isShare?: boolean | null;
  bookmarked?: boolean | null;
}

export interface FeedData {
  posts: Post[];
}

export interface FeedPagination {
  currentPage: number;
  limit: number;
  total: number;
  numberOfPages: number;
}

export interface FeedMetadata {
  feedMode?: string;
  pagination?: FeedPagination | null;
}

export type FeedResponse = ApiResponse<FeedData, FeedMetadata>;

export interface CreatedPostData {
  post: Post;
}

export function getFeed({
  page,
  limit = DEFAULT_PAGE_SIZE,
  only = "following",
}: FeedQuery): Promise<FeedResponse> {
  const query = new URLSearchParams({
    only,
    page: String(page),
    limit: String(limit),
  });
  return request<FeedData, FeedMetadata>(`/posts/feed?${query.toString()}`);
}

export function parseFeedPosts(data: unknown): Post[] {
  if (!isApiRecord(data) || !Array.isArray(data.posts) || !data.posts.every(isApiRecord)) {
    throw new Error("The feed response did not contain a posts list.");
  }
  return data.posts;
}

export function getPosts() {
  return request<unknown>("/posts");
}

export async function getPostById(postId: string): Promise<ApiRecord> {
  const response = await getPosts();
  const posts = getRecords(response.data);
  const post = posts.find((record) => getRecordId(record, "post") === postId);

  if (!post) {
    throw new Error(
      `Post ${postId} was not found in the documented posts listing. The API does not publish a verified single-post endpoint.`,
    );
  }

  return post;
}

export async function createPost(body: string, image?: File): Promise<Post> {
  const formData = new FormData();
  formData.append("body", body);
  if (image) formData.append("image", image);

  const response = await request<CreatedPostData>("/posts", {
    method: "POST",
    body: formData,
  });
  if (!isApiRecord(response.data) || !isApiRecord(response.data.post)) {
    throw new Error("The create-post response did not contain data.post.");
  }
  return response.data.post as Post;
}

export function updatePost(postId: string, body: string, image?: File) {
  const formData = new FormData();
  formData.append("body", body);
  if (image) formData.append("image", image);

  return request<unknown>(`/posts/${encodeURIComponent(postId)}`, {
    method: "PUT",
    body: formData,
  });
}

export function deletePost(postId: string): Promise<never> {
  return Promise.reject(new UnverifiedPostEndpointError(postId));
}
